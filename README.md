# Game of Throne
## Intro
San Francisco has a problem.  There is but one stall for the many throngs of people, and there is no true way of telling when it is in use (aside from getting out of your seat and checking!)

Well now, no more.  You can visit canigoyet.teespring.com and get a simple status update of its use.

## Architecture
This project consists of the following aspects:
- An S3 Bucket, configured to serve static pages
- AWS Lambda functions linked by AWS APIGateway to act as endpoints
- The Raspberry Pi attached to the stall.
- CloudFront and CloudFlare

### S3 Bucket
The S3 Bucket contains multiple files, the most important two of which are index.html and "state".

- **index.html** -- The file served to the user when they hit canigoyet.teespring.com.  Pulls in data from "state" and displays it to the user.
- **state** -- File containing a JSON blob of the state of the stall.  Currently only has "State" and "UpdatedDate".

These files are housed within the /static/ directory of this git repository.

### AWS Lambda functions with APIGateway
Rather than starting yet another Heroku server to run pretty minimal code, we opted to use [Serverless](https://serverless.com/).

Serverless is responsible for taking the code in js/handler.js and turning it into a GET endpoint that can be hit to update the "state" file in the S3 bucket.  In short, Serverless creates an S3 bucket to house extra code, an APIGateway endpoint, then attaches that APIGateway to the Lambda function via a Lambda event.

This provides two endpoints:
- /dev/poop/free
- /dev/poop/busy

Free, naturally, updates the `state` object to be free, while the `busy` endpoint updates the `state` object to be busy.  A sample `state` object has been provided for this purpose.

### The Raspberry Pi

