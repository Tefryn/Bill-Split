# Meeting Notes - February 7th
- Scribe: Eiko

## User Stories
The two primary user roles are group leader and member with the following stories. 

1. Group Leader: “As a group leader, I want to click Import Receipt.”
- Importing a receipt must happen in the background.
- The server responds immediately
- The receipt is processed later
- Use UI streaming during this process to show the items as they are parsed
- Items appear after processing completes, without refreshing

If the user has to wait several seconds for the request to finish, this requirement is not met.

2. Group member: “As a group member, I want to see the bill load instantly.”
- You must fetch the full bill efficiently (hint: REST APIs don’t do this).
- When one user claims an item, all other users must see the change immediately.
- “As a member, I should be able to claim the Burger ($15) item.”
- "As a group member, I want to pay my specific share plus tax/tip, not just an even split."


## Features
- Create a group:
    - Upload receipt (text or image)
    - Itemize costs

- Join group (id)
    - claim item & block other users (? - appetizers)

## Functions
- DB Functions:
    - create group (Str[]) -> id
    - join group(user_id: ID, group_id: ID) -> bool
    - claim item -> bool
        - calculate total cost -> float
    - create/edit Profile(user_id: ID) -> IDK

## DB setup
- groups:
    - id: ID
    - items:
        - cost: float
        - name: str
        - claimed: ID[]
        - count (TBD ???)
    - users: 
        - id: ID (link to Profile?)
        - total cost: float
    - tip: float (percentage)
    - tax: float (percentage or amount)

- Profiles
    - name
    - dietary restriction
