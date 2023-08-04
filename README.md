# This project was created for test task

## Project Setup

### Prerequisites

- Create AWS Account ([article](https://repost.aws/knowledge-center/create-and-activate-aws-account))
- AWS Admin IAM user ([documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-set-up.html#create-an-admin))
- AWS CLI installed and configured - you'll need AWS Access Key ID and Secret Key obtained from the step before (IAM user creation):

  - [How to install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
  - [How to configure AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html#cli-configure-quickstart-config)

- latest Node.js - you can download it here: [nodejs.org/en](https://nodejs.org/en)
- Install serverless framework globally with npm

```bash
npm install -g serverless
```

### Installation

Run:

```bash
npm install
```

### Deployment

Run:

```bash
serverless deploy
```

\*In order for email notification about deactivation to be sent, you need to create a secret in SecretManager with the name "EMAIL_FROM" and the value of Email from which letters will be sent, after deploy you will get notification to provided email from Amazon to verify identity.

### Endpoints

| Endpoint              | Description                     |
| --------------------- | ------------------------------- |
| POST /auth/signup     | register new user               |
| POST /auth/signin     | login user                      |
| POST /link            | create short link (protected\*) |
| GET /links            | list links (protected\*)        |
| POST /link/deactivate | deactivate link (protected\*)   |
| GET /{shortAlias}     | redirect to link by shortAlias  |

protected\*: in Headers

- authorizationToken - Bearer \\token\\

### SwaggerHub

[Short Linker API](https://app.swaggerhub.com/apis-docs/PashokSy/shot-linker-api/1.0.0#/)

---

> ## (Task) Serverless ShortLinker Product Specs
>
> ### 👀 Overview
>
> Long URLs can be inconvenient to use, especially in correspondence. To solve this problem, there are services that shorten long links. We need to build our own cost-efficient and flexible API for a link shortener application.
>
> ### 🎯 Goals
>
> The main goal is to build a fully serverless solution using AWS services that:
>
> - Allocates resources based on current demand;
> - Handles sudden traffic spikes;
> - Is using the serverless database;
> - Can be easily replicated to multiple AWS regions.
>
> ### 📂 Scope
>
> #### Users
>
> - Auth - Users must be able to login & register using email and password.
>
> #### Links
>
> - Create new shortened link - registered and authenticated users can create a new link.
> - Manage links - users should be able to deactivate previously created links.
> - Link stats - each time anyone opens the shortened link the system should record the visit in the database.
> - List my links - users should be able to see the list of links they created. This list should also have number of visits for each link.
> - Link lifetime - When creating a link the user can select how long the link will remain active. Possible options are: one-time link (should be deactivated after the first visit), 1 day, 3 days, 7 days.
>
> #### Notifications
>
> - Channels - email is the only supported notification channel.
> - Notification types
>   - Link expired (deactivated) - users should receive a message about the fact that the link has been deactivated.
>
> ### 🛠 Technical Factoring
>
> #### Infrastructure Requirements
>
> The solution must be 100% AWS-native and use only serverless services. We expect
> that your implementation will utilize the following tools and services:
>
> - AWS Lambda with the latest supported NodeJS (v18.x as for today) as the runtime.
> - TypeScript-first approach.
>   - Use esbuild for code bundling.
> - Serverless Framework or SST with CloudFormation as an IaC provider.
>   - All workloads must be described as part of the application’s stack and created automatically during the deployment without a need to re-configure them manually.
> - Amazon DynamoDB as a primary database for the app with Global Tables feature enabled to allow data replication to other regions.
> - AWS EventBridge as a scheduler for periodical tasks.
> - Amazon SQS as a queue service and Amazon SES to send email notifications.
>
> > :warning: **Since cold starts are one of the most vulnerable points in serverless computing, make sure that you keep lambda packages as small as possible, use individual packaging for each lambda function and avoid using huge external dependencies that can affect the artifact size.**
>
> #### Functional Requirements
>
> Here is the high-level list of what operations your API should support:
>
> - Auth
>   - Sign up a new user by email and password. Should return the auth token (JWE is the best option but you can use JWT as well)
>   - Sign in. create a new JWE or JWT tokens for existing users.
>   - **Important**: Use a custom lambda-based authorizer to handle tokens verification for protected endpoints.
> - Links
>   - Create a new link. Should expect an original link and the expiration time in the request.
>   - Deactivate a link (by user request) by ID.
>   - Deactivate links (by cron) that are expired.
>   - List all links created by the user.
>   - **Important**: Make sure that you generate short IDs for the links (up to 6 characters). Generate long hashes for the link shortener doesn’t make sense.
> - Notifications
>   - After the link is marked as deactivated. The sending process should be asynchronous from the process that deactivates links.
>   - The optimal way is to send a message to the SQS queue. Another lambda function responsible for sending email notifications should listen to this queue and handle incoming messages in batches of 10 messages per invocation.
>
> ### ✅ Deliverables
>
> To consider the project as done, the following parts are expected to be delivered:
>
> - OpenAPI Specs describing the design of your solution.
> - The application’s code is uploaded to GitHub repository. - The readme file must have short instructions on how to run and deploy the project and a high-level description of the project structure.
