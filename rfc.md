- Start Date: 2026-24-02
- Author: Eiko Reisz

## 1. Architecture Overview and State Model
<!-- Connor will handle -->

## 2. Featurees to Be Implemented
1. Event Queue for updating shareable split
 - User Story: Daniel and Eiko go out to dinner and share a $15 order of pizza. Daniel creates a bill split session with the shareable pizza item and claims it, setting his total to $15. Eiko joins the session and also claims the pizza, setting his total to $7.50. Daniel is then notified that Eiko has also claimed the shareable pizza and his total is then set to $7.50
 - Implementation: whenever users claim a shareable item, all other users who have also claimed said item should be informed of their new share of the price. This will be implemented by subscribing to an item specific event queue and consuming any updates (user claim/unclaim).

2. Event Queue for finalizing a bill split
 - User Story: Daniel and Connor go out to dinner and each order a $10 pizza. Daniel creates a bill split session with both pizza item and claims one, setting his total to $10. Connor joins the session and also claims the remaining pizza, setting his total to $10. Since all items have been claimed, Daniel and Connor receieve a notification that the session can be finalized. Daniel hits the button, finalizing the bill and both users are presented with the cost breakdown for each user in the session.
 - Implementation: all user's subscribe to an event queue that tracks whether a session is finalizable. Once all items in a session have been claimed, i.e. the session is finalizable, an event is produced that is then consumed by all user's informing them that the bill can be finalized (in the form of a button becoming available). Hitting this button will prevent any alterations to claims and produce a final itemized list of each person's share/total.

## 3. Miscallaneous Tasks
1. Race Condition Handling - locking items
 - Two concurrent users should not be able to claim the same item - i.e. we need ACID compliance

2. Join lobby via QR code / link
 - Potential addition rather than using a session id to join. Should ask professor if current implementation is sufficient.
