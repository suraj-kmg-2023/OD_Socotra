import express from "express";
const app = express();
const port = process.env.PORT || 3000;

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "up",
    timestamp: new Date().toISOString(),
  });
});

app.get("/getPolicyDetails/:policy_number", async (req, res) => {
  const policyNumber = req.params.policy_number;
  console.log("was here");
  const response_auth = await fetch(
    "https://api.sandbox.socotra.com/account/authenticate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: process.env.tenent_username,
        password: process.env.tenent_password,
        hostName: process.env.host_name,
      }),
    }
  );

  const js_obj_auth = await response_auth.json();
  const string_json_auth = JSON.stringify(js_obj_auth);
  const parse_json_auth = JSON.parse(string_json_auth);

  const auth_token = parse_json_auth.authorizationToken;

  // Fetching policy from policyLocator

  const response_policy = await fetch(
    "https://api.sandbox.socotra.com/policy/" + policyNumber,
    {
      method: "GET",
      headers: {
        Authorization: auth_token,
        "Content-type": "application/json; charset=UTF-8",
      },
    }
  );

  const js_obj_policy = await response_policy.json();
  const string_json_policy = JSON.stringify(js_obj_policy);
  const parse_json_policy = JSON.parse(string_json_policy);

  const premium = parse_json_policy.characteristics[0].grossPremium;
  const insured_name = parse_json_policy.characteristics[0].fieldValues.insuredName[0];
  const policy_start = parse_json_policy.originalContractStartTimestamp;
  const policy_end = parse_json_policy.originalContractEndTimestamp;

  var originalContractStartTimestamp = new Date(parseInt(policy_start));
  var originalContractEndTimestamp = new Date(parseInt(policy_end));

  // Step 2: Format the Date object into MM-DD-YYYY format
  var formattedDateString_policyStart =
    (originalContractStartTimestamp.getMonth() + 1)
      .toString()
      .padStart(2, "0") +
    "-" +
    originalContractStartTimestamp.getDate().toString().padStart(2, "0") +
    "-" +
    originalContractStartTimestamp.getFullYear();

  var formattedDateString_policyEnd =
    (originalContractEndTimestamp.getMonth() + 1)
      .toString()
      .padStart(2, "0") +
    "-" +
    originalContractEndTimestamp.getDate().toString().padStart(2, "0") +
    "-" +
    originalContractEndTimestamp.getFullYear();

  const quote_proposal_doc = parse_json_policy.documents[0].url;
  const new_business_doc = parse_json_policy.documents[1].url;

  res.status(200).json({
    successful: true,
    output_data: {
      attributes: {
        premium: premium,
        insured_name: insured_name,
        policy_start: formattedDateString_policyStart,
        policy_end: formattedDateString_policyEnd,
        quote_proposal_doc: quote_proposal_doc,
        new_business_doc: new_business_doc
      },
    },
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
