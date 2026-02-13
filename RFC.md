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

Describe 3 failure scenarios, implications, and how the system should recover.
