---
layout: post
title: AI Founder's Bitter Lesson. Chapter 4 - You’re a wizard Harry
date: 2025-01-29
description: There are plenty of problems out there, an AI app is far from the only thing you can do. 
tags: AI, Startups
categories: 
featured: false
pretty_table: true
giscus_comments: true
thumbnail: /assets/img/wizard.png
---

*Recap of previous chapters is discussed at 14:28 [here](https://open.spotify.com/episode/0mRIA7GvOnDfLFZjXMtGYi?si=4e59b786799d4da8)*

As outlined in chapter 3, I suspect that the AI application space will be very tough for startups in the coming years. The revenue growth of these companies is currently [very impressive](https://www.youtube.com/watch?v=0LMK5JYkB94), and this slope will remain positive throughout the year, but by 2027, models are so strong that horizontal offerings from the AI labs will dominate. This might seem discouraging for founders. I got a lot of comments on chapters 1 and 2 along the lines of “so you are saying we should just give up?”, but this is not at all what I am saying. There are plenty of problems out there, an AI app is far from the only thing you can do.

{% include figure.liquid loading="eager" path="assets/img/wizard.png" class="img-fluid rounded z-depth-1" width="80%" %}
Figure 1: Illustration of the fact that you are a wizard.

Founders are wizards, pulling rabbits out of hats to create value where there seem to be none. Starting a company requires novel thinking. As PG put it:

“It's not enough just to be correct. Your ideas have to be both correct and novel (...) You don't want to start a startup to do something that everyone agrees is a good idea.”

However, I think many founders have been blinded by the impressive revenue numbers of their peers. The quote above is from PG’s essay “How to Think for Yourself”. It is hard to think for yourself when everyone around you seems to all do the same thing, and that thing seems to be working. Below is my attempt. Hopefully, these ideas sound bad to you.

I do believe that the horizontal agents that will dominate the AI application layer will be built by the AI labs. It is possible that model performance diverge leading to a single winner, but I think it is more likely that there will be fierce competition between Anthropic, OpenAI, GDM and xAI. This results in a race to the bottom where the end-users are the winners in the short term.
Even if the AI labs won’t capture much of the monetary value in the short term, I think they will be very powerful. So much so that I think it makes sense for founders to think about their startup in the context of their relationship to these labs.

## Customer

As discussed in [chapter 2](https://lukaspetersson.com/blog/2025/power-vertical/), I think it is possible to build an AI vertical which uses the LLM API’s, but only if you have exclusive access to some crucial resource. If you insist on building an AI vertical, I think you should spend an enormous amount of effort trying to find such a resource.

## Competitor

If horizontal agents is the future, why not build one? Let's examine three possible approaches.

**Being First to Market**

AI labs will only compete seriously with vertical workflows once models are reliable enough to create horizontal agents with minimal engineering effort. You might theoretically beat the labs to be first to market by applying engineering effort to earlier models. But it is not certain. Leopold Aschenbrenner thinks this effort might take longer than building the next model:

“ It seems plausible that the schlep will take longer than the unhobbling, that is, by the time the drop-in remote worker is able to automate a large number of jobs, intermediate models won’t yet have been fully harnessed and integrated”

Regardless of who comes first, I don’t expect this to last very long.

**Agent API Wrapper**

My roommate once asked: "Are there no one with UI skills in the world?" He wondered why nobody had built a better ChatGPT when the API to the model is available. This suggests two problems: 1\) API costs make the margins unsustainable, and 2\) labs don't release their best models (ChatGPT uses proprietary models for retrieval, web browsing etc).

No one is competing directly with ChatGPT today using the GPT API, and I expect this pattern to repeat with horizontal agents.

**Open-Source Models**

Open-weight models might offer another path. Perplexity shows it's possible to compete with labs on a horizontal product. But while open-source models perform well on simple benchmarks, they struggle with complex agent tasks. Llama-3.1-405b lags significantly behind frontier models on MLE-bench (Figure 2). At Andon Labs, we specialize in these types of benchmarks and this matches what we see.

{% include figure.liquid loading="eager" path="assets/img/mleb.png" class="img-fluid rounded z-depth-1" width="100%" %}
Figure 2, models compared on MLE-bench.

I wrote this one month before publishing. In the meantime Deepseek V3 and R1 have been released with very impressive results. However, so was o3 (and Anthropic is [rumored](https://www.youtube.com/watch?v=7EH0VjM3dTk) to have an even better version internally). We will continue to see open source models that come close to the frontier, but I doubt they will ever surpass. However, it might be good enough to compete in the horizontal game. Note that inference cost will still be very high.

## Vendor

If the AI labs really become this powerful, being a vendor to them is a great position. They will obviously need a lot of compute and power. Maybe even more than you think if Leo’s analysis is correct (Figure 3). This opportunity requires industrial expertise, which might not come naturally for founders currently in the AI application layer. But remember what you are, a wizard.

The labs also buy data from third parties. Scale AI is proving this to be a great business. However, the question mark here is whether AI labs can make “self play” work. AlphaZero was famously trained without any external data, and this is seen as the holy grail for future AI models. If they don’t make self play work, the alternative will be to stitch multiple post training datasets together. In this world, selling data is probably a great bet\!

{% include figure.liquid loading="eager" path="assets/img/leo_power.png" class="img-fluid rounded z-depth-1" width="60%" %}
Figure 3, Projected American power generation compared to AI demand, speculated in Situational Awareness. Total electricity generation remains relatively flat while projected AI demand grows exponentially, potentially surpassing total current generation by 2030\. The largest training cluster accounts for a significant portion of this demand.

## Ecosystem

A final relationship with AI labs worth examining is becoming an ecosystem contributor. This means building tools that help horizontal agents \- but crucially, separated from the agents themselves. As Chapter 3 showed, traditional software will persist because agents need efficient interfaces. While agents could write their own software, the inference costs might make this impractical. However, ecosystem players risk becoming commodity, with most value captured elsewhere. I think this depends on how high the inference cost for running the horizontal agent is. If it is low, agents will more often prefer to write the software it needs itself.

## What if the timelines are longer?

Timelines really matter \- if horizontal agents take 10 years to become competitive, building a vertical workflow is a great idea. That's plenty of time to build a substantial company.

10 years might be unreasonable given how fast labs are moving. But what about 4 years? While it might be too little time to build a huge company, it's enough time to iterate. Starting in the AI application layer might position you well to pivot into a vendor or ecosystem role later.

## Epilogue: YC’s Bitter Lesson?

At first glance, it seems YC is making a mistake. They seem to be making the majority of their investments in a space that will soon diminish. However, I don’t understand venture capital well enough to make a confident statement. I am just venting my confusion here, please educate me.

YC claims to be largely non-opinionated. They invest in the smartest people and hope that these people find the best ideas. This is a great strategy. Hundreds of founders will be better at predicting the details about the future than the 14 YC partners.

Setting weekly goals is a big part of the batch. This is done in bigger groups, which is great for motivation. However, if the diversity of the ideas isn’t big enough, it can lead to short term thinking. Doing an AI vertical is a great idea if your goal is to hit 5k MRR next week, but I don’t think it is how you build a lasting business. But I am sure that I would be tempted to start one if I was in the current batch. Additionally, it seems like every episode of YC’s podcast “The light cone” advocates for AI verticals these days.

I thought YC’s non-opinionated strategy worked because of the inherent diversity, but maybe I am missing something.

Thanks to [Axel Backlund](https://x.com/axelbacklund) for the discussions that led to this post.

Follow me on [X](https://x.com/lukaspet) or subscribe via [RSS](https://lukaspetersson.com/feed.xml) to stay updated.
