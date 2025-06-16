---
layout: post
title: The Intern Problem
date: 2025-06-16
description: 
tags: AI, Startups
categories: 
featured: false
pretty_table: true
giscus_comments: true
thumbnail: /assets/img/two_button_meme.jpg
---

### The Intern Problem

The thing I disliked most about being employed was the lack of freedom to cut corners. I wasn't looking to slack off, but sometimes tasks required an unreasonable amount of effort for minimal gain. The exact effort involved was rarely clear when tasks were assigned, and I suspected my boss would have preferred me to cut corners had he known. But confirming that would require disturbing him. As an intern (working on a project unlikely ever to reach production), my manager's time was far more valuable than mine. Thus, I faced a dilemma.

### AI Products

The AI in your AI product faces the same dilemma, but amplified, since the difference in time value between humans and AI is far greater than between interns and managers.

As a user, I want the AI to do the task as I would have done it, cutting corners when I would have. For example, I don’t want my coding agent to write 600 lines of code for a small problem that turned out to be harder than I expected (if the task specifications were strict). However, I also don’t want it to cut corners all the time; details are sometimes important.

 The AI can ask clarifying questions, but [the productivity gain of using the product quickly drops the more I have to engage](https://www.sid.ai/blog/amdahl) (I always run Claude Code with --dangerously-skip-permissions). Asking questions at the start, rather than interrupting me later, is less costly. However, I don’t have all the answers at the start.

What does success under uncertainty look like?

### Your Favorite Coworker

You probably don’t have this problem with your favourite coworker. You understand each other so well that you can collaborate without almost any information exchange (if needed). You know when they want you to cut corners. This is of course because you have exchanged a lot of information in the past. In AI-lingo, your context window is already filled with millions of tokens of their preferences.

You also might not have this with your intern. If don’t, you were probably very generous with your valuable time and gave them a lot of context to the task specification. I expect that current AI products struggle with the Intern Problem much more than interns do because intern hosts are more generous with their time than users of AI products are. Intern hosts are confident that the intern will eventually get it, so they spend the required time. Users of AI products on the other hand are sceptical that the AI can do the task. They try a few times, and when it doesn’t work they assume it couldn’t ever work and give up.

### The Road Ahead

AI struggles with the Intern Problem even more than actual interns do. However, as humans gradually build trust in AI systems, they'll become increasingly willing to invest their valuable time upfront to provide clearer context. This shift alone, even without further AI progress, could bring AI to roughly the same level of efficiency as human interns. At this stage, significant gains in usability will come from UI. Products like Cursor demonstrate how important UI is for today's AI products.

However,  AI will progress. As AIs become better at remembering context and asking the right questions to know your preferences, interaction will be like working with your favorite coworker. At this point, UI will matter less. Just as you don't require complex interfaces to communicate effectively with your your favorite coworker, natural language will be sufficient for interacting AI.

Still, as long as a human is part of the task definition process, some form of the Intern Problem will persist, since humans themselves are imperfect managers. We rarely know precisely what we want upfront, and task specifications will inevitably remain incomplete or ambiguous to some degree. However, as AI systems improve, human involvement in detailed specification will decrease, transitioning from micromanagement towards providing broad, high-level objectives. These more abstract goals are typically easier to specify accurately, ultimately reducing the friction inherent in the Intern Problem.

Follow me on [X](https://x.com/lukaspet) or subscribe via [RSS](https://lukaspetersson.com/feed.xml) or [Substack](https://lukaspet.substack.com/) to stay updated.

Thanks to David Fant, Max Rumpf and Axel Backlund for feedback <3
