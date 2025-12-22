+++
title = "Basic CI/CD pipeline with AWS S3, 11ty and GitHub Actions"
date = 2022-08-25
[taxonomies]
tags = ["devops", "aws", "github", "ci/cd"]
[extra]
archive = "This post was published more than 2 years ago. It's content is most probably out of date!"
+++

> As a DevOps learning project, I've decided to host a copy of this website on AWS using S3 and CloudFront services. From the current process that's using Vercel as a build/deploy tool, I'm now trying the manual way to learn the intricacies of it all: GitHub Actions, CloudFront and S3. The first step is to do it with the AWS web management console, and then to use Terraform and IaC to put this in place.

As you may know, this website is built using [Eleventy](https://11ty.dev), a static site generator. I build the website locally, and push it to GitHub in a private repository. Currently, I use Vercel to build and deploy the website automatically on each push to the main branch. Each changes then goes live and is available at https://jrb.nz in the following minutes.

**The goal here is to manually do the part that Vercel does for me: host the website in a AWS S3 bucket, automate the build/deploy pipeline with GitHub Actions, and add CloudFront as the CDN on top of it.**

I'll explain how to proceed with the AWS Management Console, and then (eventully) link to the IaC Terraform files at the end.

## Create a S3 bucket for webhosting

1. Log into the AWS Management Console, and navigate to the S3 section
2. Click on the button **Create bucket**
3. Choose the region in which you want your bucket (I'm using us-east-2 to stay in the Free Tier)
4. Untick **Block all public access**: we want the files inside the bucket to be available to anyone on the web
5. Acknowledge that you know the risks by ticking the following checkbox
6. Leave the remaining settings as is, and click **Create bucket**

The bucket is now created. Click on it to modify some properties:

1. Click your bucket name in the list
2. Go over the **Properties** tab
3. Scroll all the way down to the **Static website hosting** section
4. Click Edit, and choose **Enable** for Static website hosting
5. Define the Index document, in my case `index.html`
6. Save the changes
7. Note your bucket website endpoint : that'll be the URL for our site!

Now we need to define the Bucket policy! Switch to the **Permissions** tab:

1. Click on **Permissions** tab
2. Scroll to the **Bucket policy** section
3. Click Edit, then enter the following JSON policy:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME-HERE/*"
        }
    ]
}
```

4. Replace `YOUR-BUCKET-NAME-HERE` by your current bucket name
5. Be aware that this policy makes EVERYTHING public inside your bucket. You might want to use something more strict!
6. And save the changes

That's it, the bucket is ready to be used as for website hosting.

## Create the IAM policies and user

Following best practices in security is always a good idea. For this reason, we'll create a new user that'll be used only for this project, and only with the minimal required permissions/policies.

Here's what we need to give permissions for:

1. Send and delete data inside the S3 bucket
2. Send invalidation request for CloudFront (to make sure we are serving the most recent version of the site after pushing changes)

### Create the policies

1. Go into the AWS IAM section
2. On the left, choose **Policies**
3. Then click **Create policy**
4. Use the following JSON for the S3 policy:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:DeleteObject",
                "s3:GetBucketLocation"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR-BUCKET-NAME-HERE",
                "arn:aws:s3:::YOUR-BUCKET-NAME-HERE/*"
            ]
        }
    ]
}
```

5. Click Next: Tags, then Next: Review, then give it a good name and click Create Policy.
6. Next, we need to create a second policy for the cache invalidation in CloudFront. Do the same as before, but with the following JSON:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "cloudfront:ListInvalidations",
                "cloudfront:GetInvalidation",
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "arn:aws:cloudfront::CLOUDFRONT-ID:distribution/*"
        }
    ]
}
```

7. Replace `CLOUDFRONT-ID` with your unique CloudFront distribution ID (you can find it in the ARN.
8. Give a name to your policy and Create it!

### Create a new user

1. Go into the AWS IAM section
2. On the left, choose **Users**
3. Then click **Add users**
4. Give it a good name, and choose Access key as the credential type.
5. Go into the **Attach existing policies directly** tab
6. Choose the two policies we just created (first one for S3 access, then the CloudFront one)
7. Click Next: Tags, then Next: Review, and Create the user.
8. Don't forget to save the credentials! We need them in the next steps.

### Add GitHub repository secrets

Head to your GitHub repository, and go into the Settings.

1. On the left, under Security, click **Secrets**, then **Actions**
2. Create four new secrets for each of these:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - CLOUDFRONT_ID
   - S3_BUCKET

This way, the AWS credentials won't be exposed in your GitHub Actions file, neither will your CloudFront distribution ID or the name of your S3 bucket.

## GitHub Actions

In your GitHub repo, go into the **Actions** tab. Click **New Workflow** and add the following:

```
name: Build and Deploy to S3
on: [push]
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2.3.4

      # Uncomment if you want to specify a certain
      # Node version. Otherwise the Node version installed
      # on the GitHub VM will be used. For more details
      # see: https://github.com/actions/virtual-environments
      # - name: Setup Node.js environment
      #   uses: actions/setup-node@v2.1.4
      #   with:
      #     node-version: '15.7.0'

      - name: Install dependencies
        run: npm ci

      - name: Build the website
        run: npx @11ty/eleventy

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-2 # replace this with your aws-region

      - name: Upload files to S3 with AWS CLI
        run: |
          aws s3 sync public/ s3://${{ secrets.S3_BUCKET }} --delete

      - name: Invalidate CloudFront cache for all paths
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"

```

That's it for the GitHub Action! The workflow should run after commiting the `main.yml` file. If all went well, you should have your site up at your S3 URL saved earlier! Check the logs to make sure there's no errors.

## CloudFront

The last step is to add CloudFront as the CDN on top of the S3 bucket. For this, I'm using a cheap domain I had laying around. You can do it without a domain, the CloudFront default URL can be used for learning purpose.

### Create distribution

1. Go into the AWS CloudFront section, and click Create distribution
2. As the Origin domain, you need to enter your S3 URL (without the http/https)
3. All the other defaults parameters works for us, leave them as is.
4. Click Create Distribution, and wait for it to be created in AWS.

You could stop here if you wanted. Using the CloudFront default domain name, you can then have access to your site! But I wanted to go a step further and a my own domain name.

### Request a certificate for your domain

To proceed here, you need your own domain. You can get some cheap ones if you want.

1. Go into the AWS Certificate Manager section
2. Click **Request** to start a new request
3. Choose **Request a public certificate**, then click Next
4. Enter your domain name in the field for it, then choose **DNS validation**
5. Click **Request** at the end

To validate that you're the owner of the domain, you need to add a CNAME record. AWS will give you a Name and a Value that you enter in the record. Create the record, and wait a minute. AWS should then issue your certificate!

### Define alternative domain for CloudFront distribution

1. Back into the CloudFront section, choose your distribution
2. In the Settings section, click Edit to add the alternative domain
3. Enter the alternate domain, and choose the certificate that was just issued
4. Save the changes

### Add CNAME record

Finally, we add the CNAME record linking our domain to the CloudFront distribution.  
`CNAME @ YOUR-CLOUDFRONT-URL`

## Next steps ?

Using the AWS web management console is only half the job: I want to do this using IaC. I would also like to create some type of logging, maybe add a dashboard for it.

## Final word

That's it! I now have a live copy of this website on AWS S3. When I commit changes to the repository, two builds will run in parallel:

1. Vercel will build and deploy
2. GitHub Actions will trigger a build and deploy to S3, and the CloudFront cache will be refreshed

To complete this, I had some help from the following:

- https://cri.dev/posts/2019-08-29-Deploy-Eleventy-site-with-Github-Actions-on-AWS-S3/
- https://monicagranbois.com/blog/webdev/use-github-actions-to-deploy-11ty-site-to-s3/
- https://florian.ec/blog/static-website-github-actions-s3-deploy/
- https://boodyvo.hashnode.dev/deploy-a-static-website-on-aws-with-terraform

The initial idea came from [this Reddit comment](https://www.reddit.com/r/devops/comments/wuetf4/comment/il9lry8/?utm_source=reddit&utm_medium=web2x&context=3).

## Two days later edit (08/27)

I noticed that my initial S3+CloudFront setup was allowing requests to be sent directly to the S3 bucket website endpoint, which isn't something you want when using caching through CDN such as CloudFront. I found a way to change this so that only the CloudFront URL can be used (or its alternate domain name).

A couple of things were modified to make it work:

- Static web hosting has to be activated on the S3 bucket, but I also had to block all public access
- I created a CloudFront Origin access identity (legacy), that is then used inside the bucket policy to allow access (and it's assigned inside the CloudFront distribution)
- The Object Ownership is Bucket owner enforced in the S3 bucket
- Added a CORS configuration allowing GET requests on all origins
- [And finally added a CloudFront function that appends `index.html` at the end of URL that don't have it](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/example-function-add-index.html) (filenames within directories are hidden with Eleventy)
