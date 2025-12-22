+++
title = "Zsh function to assume a role in AWS"
date = 2023-06-14
[taxonomies]
tags = ["aws", "script", "cli", "web"]
[extra]
archive = "This post was published more than 2 years ago. It's content is most probably out of date!"
+++

Working in AWS, I sometimes need to test a role to debug some issues or validate some hypotheses.

I'm already using the [Granted CLI](https://github.com/common-fate/granted) to assume federated roles in the AWS accounts I have access to, but it doesn't let me quickly change role (either in the same AWS account or in another one).

I wrote a small Zsh function to make this possible.

## Prerequisites

- AWS CLI installed
- Granted CLI app installed and set up
- A directory to store your Zsh functions (in my case, `~/.zfunctions`)
- `.zshrc` configured to autoload functions from that directory

## Autoload functions in `.zshrc`

Add these lines inside your `.zshrc`:

`fpath=(~/.zfunctions $fpath)`
`autoload -Uz ${fpath[1]}/*(:t)`

## Zsh function: `role-assume`

Write the following to the file `~/.zfunctions/role-assume`

````
```zsh
#!/usr/bin/env zsh

role-assume() {
  if [[ -z "$1" ]]; then
    echo "Usage: role-assume <role-arn>"
    echo "Example: role-assume \"arn:aws:iam::123456789000:role/role-name\""
    exit 1
  fi

  local out
  if ! out=$(aws sts assume-role --role-arn "$1" --role-session-name assume-role-local-func --output json); then
    echo "Failed to assume role" >&2
    exit 1
  fi

  export AWS_ACCESS_KEY_ID=$(echo "$out" | jq -r '.Credentials.AccessKeyId')
  export AWS_SECRET_ACCESS_KEY=$(echo "$out" | jq -r '.Credentials.SecretAccessKey')
  export AWS_SESSION_TOKEN=$(echo "$out" | jq -r '.Credentials.SessionToken')

  echo "Trying 'aws sts get-caller-identity'"
  aws sts get-caller-identity | jq -r '.UserId'
}
````

```

### Testing

Open a new shell. You should now be able to assume a role by passing the ARN to the function.

```

# use granted `assume` cli app to get the initial credentials

assume account-role-x

# [✔] [account-role-x](ca-central-1) session credentials will expire in 8 hours

# call the function with a role ARN

role-assume arn:aws:iam::role-y-other-account

Trying 'aws sts get-caller-identity'
ABCDREEEEWWWWKBKB:role-y-other-account

```

The function is outputting the userId returned by `aws sts get-caller-identity` to confirm that we now have the new credentials.

Obviously, the trust policy in the role you want to assume must allow the initial role/user to allow sts:AssumeRole. Such as:

```

{
"Version": "2012-10-17",
"Statement": [
{
"Effect": "Allow",
"Principal": {
"AWS": "arn:aws:iam::111122223333:role/account-role-x"
},
"Action": "sts:AssumeRole"
}
]
}

```

```
