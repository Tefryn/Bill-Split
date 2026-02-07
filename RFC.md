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

Create schemas for the data models (ex: id, sessions, items, etc)
Considerations: What conditions must never happen in your system?

## 4. API Design

Consider the following actions and explain which API format should be used and why:
Simple actions such as uploading a receipt
Fetch group, bill, user, and other nested data
Realtime updates

## 5. Failure Scenarios

Describe 3 failure scenarios, implications, and how the system should recover.
