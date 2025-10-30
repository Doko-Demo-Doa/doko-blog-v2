---
title: Comparing the JS datetime libraries
description: Comparing date-fns, dayjs, luxon, moment
date: 2025-10-30
tags: [programming]
author: Kuon
---

I've been working with various date libraries written in Javascript / Typescript, some of them are great, some are good enough. You probably used some of those already. Let's make a nerdy comparison.

# Criteria

I'm going with following bullets:

- NPM trending
- Update frequency
- API and usage
- Bundle size

# NPM trending

![dama](/img/date-lib-comparison/npm-trending.png)

So we can see: date-fns > dayjs = moment > luxon

Link to npmtrends: [Here](https://npmtrends.com/date-fns-vs-dayjs-vs-luxon-vs-moment)

# Update frequency

No matter how good the library is, if it's not actively maintained, it won't be good in the long run, which includes bug fixes, compatibility patches and security patches.
The libraries are updated frequently. So it's a good sign (except for momentjs).

# API and usage

`date-fns` is built on top of native `Date`, which is why it's so lightweight. Their usages are similar, and are quite easy to approach.

- dayjs

```ts
import dayjs from "dayjs";

const date = dayjs().format("YYYY-MM-DD");
console.log(date);
```

- date-fns

```ts
import { format } from "date-fns";

const date = format(new Date(), "YYYY-MM-DD");
```

- luxon

```ts
import { DateTime } from "luxon";

const date = DateTime.now().toLocaleString(DateTime.DATE_FULL);
```

- moment - same with dayjs

```ts
import moment from "moment";

const date = moment().format("YYYY-MM-DD");
console.log(date);
```

# Bundle size

Now let's take a look at the library sizes. We have original size (quoted from [npmjs.com](https://www.npmjs.com/)), and bundled size (quoted from [bundlephobia](https://bundlephobia.com)).

| Lib      | Original size | Bundled size (minified) | Bundled size (minified + gzipped) |
| -------- | ------------- | ----------------------- | --------------------------------- |
| dayjs    | 672 KB        | 6.9 KB                  | 3 KB                              |
| date-fns | 22 MB         | 77.2 KB                 | 17. KB                            |
| luxon    | 4.59 MB       | 81.6 KB                 | 24.1 KB                           |
| moment   | 4.35 MB       | 294.9 KB                | 73.1 KB                           |

`dayjs` is the smallest, thanks to modular design. Timezone and extended locale are available through plugin system. It's also easy for tree-shaking.

# Conclusion

I'm good with moment and dayjs, so I'm continuing to use them (mostly dayjs). `date-fns` is also being used in one of my pet project as well. They are all mature libraries, so pick what you are familiar at, considering the requirements as well.

| Lib      | Trending | Update frequency | API and usage | Bundle size |
| -------- | -------- | ---------------- | ------------- | ----------- |
| dayjs    | ▲        | ◉                | ◉             | ◉           |
| date-fns | ◉        | ◉                | ▲             | ◉           |
| luxon    | ◯        | ◉                | ◯             | ▲           |
| moment   | ▲        | ◯                | ◉             | ◯           |
