# Gamified Dismissal Screen Design

This document outlines a conceptual design for a gamified dismissal screen aimed at engaging K‑12 students while helping staff efficiently identify which students should be sent to the gate for pickup. The theme is centered around soccer to keep the atmosphere playful and collaborative.

## Core Objectives
1. **Highlight students whose parents are waiting at the gate** so staff can quickly press **Deliver**.
2. **Captivate students** so they eagerly watch the screen for their name to appear.
3. **Promote a collective goal** that unites the class.
4. Scale horizontally to show up to **50 students** at a time from potentially different classes.

## Layout Overview
- The screen is arranged horizontally in a grid. Each student card fits into a slot, and the grid automatically wraps to maintain one consistent row height.
- A prominent scoreboard stretches across the top or bottom to show the class’s collective progress in the soccer-themed mini-game.
- Each student card includes:
  - Profile picture
  - Student name
  - Gate information (e.g., *Gate A*, *High School Gate*)
  - Status icon indicating **“On the way”** or **“At the gate”**
  - **Deliver** button (only visible for students whose parents are at the gate)

## Color & Visual Distinction
- **At the gate:** cards glow or flash with a green outline, and the **Deliver** button is highly visible. This creates urgency for staff.
- **On the way:** cards display a steady blue or yellow outline to indicate the student’s parent is en route.

## Gamification: Soccer Theme
- Every time a staff member taps **Deliver**, a virtual soccer ball moves closer to the opponent’s goal on the scoreboard.
- After a certain number of successful deliveries (e.g., every 5 deliveries), the class “scores a goal.”
- Goals accumulate as the week progresses, encouraging students to watch for their name so they can contribute to the team’s score.
- Animation triggers (e.g., crowd cheer audio or confetti) play whenever a goal is scored.

## Screen Flow
1. **Initial State**: Cards are displayed for all students in the room. Students without pickup updates show a subtle status indicator (“No update yet”).
2. **Parent En Route**: As soon as the system marks a parent on the way, the respective card updates with a blue/yellow outline. This primes both students and staff.
3. **Parent At Gate**: The card shifts to a green glowing outline, and the **Deliver** button appears. Staff must press **Deliver** to confirm the student has been sent out.
4. **Post Deliver**: The card fades away (or shrinks) to make room for others, and the scoreboard animation plays, moving the soccer ball toward the goal.

## Scalability & Mixed Classes
- Cards remain the same size regardless of the class. Students from different classes simply appear in the same grid.
- The gate location is clearly labeled under each name so staff can direct students correctly.

## Additional Engagement Features
- A small progress bar under the scoreboard shows how close the class is to the next goal.
- A leaderboard displays the number of goals scored this week, fostering a playful competition between classes or groups.
- Optional fun facts or trivia questions can appear during downtime to keep students entertained while waiting.

## Urgency for Staff
- **Deliver** buttons are bright green with a pulsing animation.
- An audible chime or voice prompt can accompany a parent arrival to further draw staff attention.
- The screen automatically sorts so students “At the gate” appear first in the grid.

This design aims to transform the dismissal process into a quick, enjoyable activity, motivating students to watch the screen while ensuring staff can easily spot which students need to be delivered to the gate.

