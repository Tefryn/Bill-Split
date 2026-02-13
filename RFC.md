- Start Date: 2026-07-02
- Authors: Eiko Reisz, Harrison Gillespie, Daniel Rivero, Fung Lok, Connor King

## 1. Architecture Overview

System Diagram: Show the major parts of your system
Sequence Diagram: For each of the user stories/flows, show what happens in the system. 

## 2. State Model

Diagram the important pieces of information that your system tracks.

Considerations:
When does it change?
Who changes it?
What is the lifecycle of the state?
Ex: What states would a bill item go through?

## 3. Data Model (Schema)

Create schemas for the data models (ex: id, sessions, items, etc):
```
sessions:
 - id: ID
 - name: str
 - items:
    - id: ID
    - cost: decimal
    - name: str
    - claimedBy: ID[]
    - shareable: bool
 - users: 
    - id: ID (foreign key to Profile)
    - total cost: decimal
 - tip: decimal (percentage)
 - tax: decimal (percentage or amount?)

profiles
 - id: ID
 - name: str
 - dietary restrictions: str[]
```

Considerations: What conditions must never happen in your system?
 - items that aren't shareable (i.e. shareable = false) must never have a claimed list of length greater than 1.
 - ids should never be nondistinct.
 

## 4. API Design

Consider the following actions and explain which API format should be used and why:
Simple actions such as uploading a receipt
Fetch group, bill, user, and other nested data
Realtime updates

We'll use a Graphql API with a Springboot backend. Graphql allows us to easily query both tables at once, (i.e. not underfetch as with API). 
As for additional considerations:
 - we'll have to make sure that we properly handle race conditions when multiple users try to claim the same unshareable item at once.
 - As we won't implement OCR for our initial CRUD app, we will need 2 versions of our createGroup function, one that accepts a list of items, and the other that accepts images.

Item type:
```
class Item:
    title: str
    cost: int
    claimedBy: ID[]
    shareable: bool
```

Group input:
```
input CreateGroupInput {
  items: Item[]!
  tax: decimal!
  tip: decimal!
  name: String
}

scalar Receipt
```

Creating a group / Uploading a receipt:
```
# Version 1
mutation CreateGroup($input: CreateGroupInput!) {
  createGroup(input: $input) {
    id
  }
} 

# Version 2
mutation CreateGroup($input: Receipt!) {
  createGroup(input: $input) {
    id
  }
} 
```

Fetch a group:
```
query fetchGroup($id: ID!) {
  fetchGroup(id: $id) {
    id, 
    name, 
    items,
    users,
    tip,
    tax
  }
}
```

Claim / unclaim an item:
```
mutation ClaimItem($itemId: ID!, $userId: ID!) {
  claimItem(itemId: $itemId, userId: $userId) {
    success?,
    total
  }
}

mutation UnclaimItem($itemId: ID!, $userId: ID!) {
  unclaimItem(itemId: $itemId, userId: $userId) {
    success?, 
    total
  }
}
```

## 5. Failure Scenarios

Below are 3 possible failure modes of this project, and how they will be addressed.

1. OCR Scanning Failure 

When a user sends their photo to the system, the OCR scanning may not be perfect due to a number of different reasons. The photo could be grainy, there could be poor lighting, the receipt could be dirty, or the photo just doesn’t get through. In these scenarios, the user will be given some agency. They will have the option to resend their receipt to hopefully get a better scan. They will also have the option to correct names and/or prices on the receipt if the scan interprets them wrong, and the option to enter all the data manually if they have no access to a camera.

2. Stale Data Request

When a user is out at a restaurant, the wifi may be poor or their data might be slow. When making a request to the app, it may take longer than they expect, prompting them to make the request multiple times (spamming the “create group” button, etc). If the user makes the same exact request over and over again, duplicate requests will be ignored until the app confirms whether a connection has been made with the server or not. A user may also leave the group view in the middle of fetching information about what members have claimed what items. In this case, any interaction with the server will be cancelled, with something like abortController.


3. Concurrent mutations and double claim (race condition & stale UI action)

Multiple users could attempt to mutate the same shared state concurrently. For example, two clients claim the same receipt item at nearly the same time, or a user may attempt to claim an item using a stale UI view that fails to reflect the most recent ownership state. Additionally, duplicate submissions (e.g. double-clicking “Import Receipt”) may occur under poor network conditions. The backend will enforce the rule that the receipt item only has one active user. Items are claimed using unique identifiers or atomic conditional update, where the backend (server & database) permits claims on items currently unclaimed. When multiple users attempt to claim an item, only the first successful mutation (claim) is processed. Subsequent claims receive a conflict response via UI streaming. For duplicate “Import receipt” calls, an idempotency key will be used to prevent double-clicking from generating create two bills/jobs.