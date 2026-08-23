import { promises as fs } from "fs";

type Faq = { question: string; answer: string };

const translations: Record<string, Faq[]> = {
  "valutare-output-agenti-ai": [
    { question: "How do you evaluate the correctness of an AI agent's output?", answer: "Correctness is validated against a verifiable ground truth: is the result functionally correct? Did the agent use correct sources? Does the output respect the required format and content constraints?" },
    { question: "What are guardrail metrics for AI agents?", answer: "Guardrail metrics measure the side effects you do not want the agent to produce: rate of inappropriate responses, use of outdated sources, wrong escalations, or irreversible actions executed without confirmation." },
    { question: "How do you measure the usefulness of an AI agent?", answer: "Usefulness is measured from the user's point of view: was the task the user wanted to complete actually completed? How much time did the user save? Would the user turn to the agent again?" },
    { question: "Why is safety an output metric for AI agents?", answer: "Safety measures whether the agent produces outputs that violate company policies, expose sensitive data, or perform harmful actions. It is a binary metric (safe/unsafe) that must be verified systematically." },
  ],
  "unit-economics": [
    { question: "What is CAC?", answer: "CAC (Customer Acquisition Cost) is the total acquisition cost divided by the new customers acquired. It includes marketing, advertising, and direct sales costs." },
    { question: "What is LTV?", answer: "LTV (Lifetime Value) is the margin a customer generates over their entire lifetime. It is calculated as average margin per order x purchase frequency x customer lifetime." },
    { question: "When is the LTV/CAC ratio too low?", answer: "When it is below 3:1. It means every euro spent acquiring a customer returns less than three euros of margin over the long term. Below this level, the model does not scale without burning cash." },
    { question: "How do you reduce the payback period?", answer: "You reduce it by increasing margin per transaction, increasing purchase frequency, or reducing CAC. The most powerful combination is increasing margin while keeping CAC stable." },
  ],
  "sql-per-marketing": [
    { question: "Why learn SQL for marketing?", answer: "Because marketing data lives in relational databases. SQL is the language to query them directly, without intermediaries. Those who know SQL do not depend on developers to answer data questions." },
    { question: "What are the most useful SQL queries for marketing?", answer: "The queries that matter: funnel conversion (from page view to order), cohort analysis (users by first-purchase date), and segmentation (by channel, device, and behavior). These three cover 80% of marketing questions." },
    { question: "SQL vs Excel: what is the difference?", answer: "Excel is fine for analysis on static data. SQL is necessary when data changes continuously, is large, or requires joins between tables. For e-commerce, SQL is often the only way." },
    { question: "Which marketing roles require SQL in 2026?", answer: "Most growth, analytics, and performance marketing roles. You do not need to be a programmer: you need to read, modify, and write simple queries to extract insights." },
  ],
  "sondaggi-online": [
    { question: "What is the main problem with online surveys?", answer: "Sampling is not random: those who answer online surveys do not represent the population. Results are good for understanding internal trends, not for generalizing to the whole population." },
    { question: "How do you improve the quality of an online survey?", answer: "You stratify the sample (trying to reach all segments), calibrate on census data when possible, and clearly report the margin of error." },
    { question: "What does 'calculable margin of error' mean?", answer: "It means you can estimate how far the survey result deviates from the true value. A 3% margin means the real value lies between the result minus 3% and the result plus 3% (at a given confidence level)." },
  ],
  "ricerche-mercato-rock": [
    { question: "What is a 'rock' market research?", answer: "Research that challenges conventional assumptions, collects primary data (observation, interviews), and produces insights that change strategy. Not a generic report, but an analysis that answers a specific question." },
    { question: "How do you do low-cost market research?", answer: "With direct observation (watching customers use the product), in-depth interviews (5-10 typical users), and analysis of public data (reviews, social, prices). It costs time, not money, but produces higher-quality insights." },
    { question: "What is the most common mistake in market research?", answer: "Asking users what they want instead of observing what they do. People do not always know why they act, and survey answers more often reflect what they want to appear to be than what they actually do." },
  ],
  "rag-growth-engineering-agenti-ai": [
    { question: "What is RAG and why is it relevant for growth engineering?", answer: "RAG (Retrieval-Augmented Generation) combines a language model with a retrieved knowledge base. For growth engineering, it lets AI agents access proprietary data (metrics, documentation, history) to produce contextually accurate outputs." },
    { question: "How do you build an effective RAG strategy?", answer: "An effective RAG strategy requires: (1) identified and updated sources of truth, (2) a chunking strategy that preserves semantic context, (3) an embedding model suited to the domain, (4) continuous retrieval evaluation to verify the right sources are retrieved." },
    { question: "What is the main risk of RAG?", answer: "The main risk is that the agent retrieves outdated or irrelevant sources and presents them as truth. Without systematic evaluation of retrieved source quality, RAG can produce more persuasive but less accurate outputs." },
  ],
  "privacy-first-analytics": [
    { question: "What is privacy-first analytics?", answer: "An approach that collects only the necessary data, with explicit consent, and uses it only for the stated purpose. After GDPR and iOS 14.5, it is no longer an option: it is a requirement." },
    { question: "Which data is not needed in analytics?", answer: "IP, fingerprint, device ID. For most analyses, navigation events and user choices are enough, without identifying the person. Full anonymization is possible and often mandatory." },
    { question: "How do you measure whether data was collected in a privacy-compliant way?", answer: "Consent audit (do you have consent for every collected data point?), data testing (can you prove the data is anonymous?), and data flow documentation (who has access, for what)." },
  ],
  "pricing-matematico": [
    { question: "What is price elasticity?", answer: "Elasticity measures how much demand changes when you change the price. It is calculated as % change in volume / % change in price. If it is greater than 1, volume drops more than proportionally to price; if it is less than 1, you have room to raise prices." },
    { question: "How do you find the optimal price?", answer: "The optimal price maximizes total margin, not volume. It is found by testing different prices on homogeneous segments and measuring local elasticity, not by applying a theoretical formula." },
    { question: "When does it make sense to raise prices?", answer: "When elasticity is low (customers do not flee), when you have margin to absorb lost volume, and when perceived value exceeds cost. If customers are price-sensitive, raising prices destroys volume but improves margin." },
    { question: "How do you test a new price?", answer: "With an A/B test on homogeneous segments, measuring not only conversion rate but also subsequent churn and LTV. A higher price that reduces churn can be superior even if it reduces initial sales." },
  ],
  "nps-critique": [
    { question: "What is the Net Promoter Score (NPS)?", answer: "A metric that asks 'how likely are you to recommend this product to a friend or colleague?' on a 0-10 scale. Promoters (9-10) minus detractors (0-6) = NPS. It is an advocacy metric, not direct satisfaction." },
    { question: "What is the main problem with NPS?", answer: "NPS measures intentions, not behaviors. Many promoters never actually recommend, and many detractors stay loyal out of inertia. It does not predict churn better than other metrics, and it is sensitive to cultural context." },
    { question: "How do you use NPS usefully?", answer: "As an initial screen to identify detractors to contact, and as a trend over time (more than as a single number). But not as the main target of a growth team." },
  ],
  "mappe-percettive": [
    { question: "What is a perceptual map?", answer: "A tool to position brands along two dimensions relevant to customers (e.g. price vs quality, innovation vs tradition). It helps you understand where you are perceived and where you want to be." },
    { question: "How do you build a perceptual map?", answer: "You identify the two key dimensions, collect data on customer perception of brands along those dimensions, and plot the brands on a scatter. The dimensions must be orthogonal and meaningful to the buyer." },
    { question: "What is the most common mistake?", answer: "Choosing dimensions that do not interest customers or that are correlated (e.g. price and perceived value). A perceptual map only works if the dimensions are truly independent and matter for the decision." },
    { question: "What is a perceptual map for?", answer: "To identify empty positioning (unoccupied spaces), to understand how competitors see you, and to test whether your positioning strategy is working." },
  ],
  "innovazione-ateneo": [
    { question: "Why do Italian universities struggle to innovate?", answer: "Because of incentives (tenure before applied research), funding (little for impact), and structure (little collaboration with the private sector). The PNRR allocated 3 billion, but culture changes slowly." },
    { question: "What can universities learn from corporate data teams?", answer: "Adopt a measurement culture: clear outcomes, success metrics, rapid iterations. Universities tend to measure inputs (papers, citations), companies measure outputs (business value)." },
    { question: "How do you measure research impact?", answer: "Not just citations or papers. Impact = real problems solved, technologies transferred, startups born, policies influenced. The PNRR allocated funds with impact targets, not just output targets." },
  ],
  "incrementality-marketing": [
    { question: "What is incrementality in marketing?", answer: "Incrementality measures how much added value marketing generates above the organic baseline. It says 'how much you sell with the campaign minus how much you sell without', not 'how much you sell with the campaign'." },
    { question: "Why is incrementality hard to measure?", answer: "Because you cannot see the counterfactual: how much you would have sold without the campaign. You need a control group (e.g. geographic or temporal holdout) to estimate it." },
    { question: "How do you test incrementality?", answer: "With a geographic or temporal test: the campaign runs in some regions (test) but not others (control). The comparison between the two areas estimates the incremental impact." },
    { question: "What is the most common mistake?", answer: "Confusing attribution with incrementality. Attribution says 'this campaign preceded the order'. Incrementality says 'this campaign caused the order'. They are different questions." },
  ],
  "hadi-cycles": [
    { question: "What is a HADI cycle?", answer: "HADI stands for Hypothesis-Action-Data-Insight. It is the growth learning cycle: formulate a hypothesis, execute an action (test), collect data, extract insight, and restart the cycle with a new hypothesis." },
    { question: "How does a HADI cycle differ from a traditional A/B test?", answer: "A traditional A/B test stops at the answer (winner vs loser). A HADI cycle goes further: it uses the data to update the team's mental model, not just to decide the next feature." },
    { question: "What is the risk of HADI cycles?", answer: "Peeking (looking at results before confirmation) and confirmation bias. If you look at the data before finishing the test, you risk stopping too early or postponing the end when you do not like the result." },
  ],
  "growth-engineering-triggering-test": [
    { question: "What does triggering mean in an experiment?", answer: "Triggering defines which units are actually exposed to the treatment. Only units that had the possibility of receiving the treatment should be included in the analysis." },
    { question: "Why is triggering crucial?", answer: "If users who could not be exposed to the treatment end up in the analysis group, the measured effect is diluted and you risk missing a real result, or seeing a spurious one." },
    { question: "How do you define triggering?", answer: "Triggering is defined by identifying the point in the user flow where the treatment appears. Example: for a test on an onboarding agent, the trigger is 'user who reaches the setup screen'." },
    { question: "What happens if triggering is too broad?", answer: "A too-broad trigger includes users who could not see the treatment, diluting the measured effect and reducing the test's sensitivity." },
  ],
  "growth-engineering-team-cross-funzionale": [
    { question: "Why must the growth team be cross-functional?", answer: "The growth cycle (hypothesis -> test -> learning) spans product, engineering, data, and design. If these teams work in silos, the cycle slows down: every hand-off adds latency and loss of context." },
    { question: "Which roles are essential in a growth team?", answer: "At minimum: an engineer with a growth mindset, a data analyst or scientist, a product manager who defines priorities, and a designer for UI experiments. In larger companies, these roles specialize." },
    { question: "How do you organize a cross-functional growth team?", answer: "Around a north star metric and a set of prioritized hypotheses. The team works in short cycles (1-2 weeks) with a demo at the end of each cycle showing results and next steps." },
  ],
  "growth-engineering-scorecard": [
    { question: "What is a growth scorecard?", answer: "A growth scorecard is a page that summarizes the current state of the growth funnel: acquisition, activation, retention, referral, and revenue. It is a decision tool, not a report." },
    { question: "Who is a growth scorecard for?", answer: "Everyone: the growth team to know where to focus, leadership to assess business health, investors to see progress. It must be readable in 30 seconds and deep enough to support decisions." },
    { question: "How do you prevent a scorecard from becoming vanity?", answer: "A scorecard becomes vanity when metrics do not lead to actions. Every metric on the scorecard must have a threshold that, if crossed, triggers a specific workstream. If a metric has no decision implications, it should not be on the scorecard." },
  ],
  "growth-engineering-ruolo-ingegnere-prodotto": [
    { question: "What does a growth engineer do?", answer: "A growth engineer is an engineer with a product mindset who builds systems to generate and test growth hypotheses: experimentation infrastructure, data pipelines, dashboards, analytics tools, and growth features." },
    { question: "What is the difference between a growth engineer and a full stack?", answer: "A full stack builds any requested feature. A growth engineer is focused on systems that accelerate the ideate -> test -> learn cycle, with a cross-cutting vision connecting analytics, infrastructure, and product." },
    { question: "What skills are needed for growth engineering?", answer: "Software engineering (back-end and data), a statistical mindset to interpret experiments, product sense to identify the right levers, and communication to translate results into business decisions." },
  ],
  "growth-engineering-retrospettive": [
    { question: "What is an experiment retrospective?", answer: "An experiment retrospective is a structured session that follows every experiment (whether positive, negative, or inconclusive) to extract knowledge that improves the next experiments." },
    { question: "When do you run a retrospective?", answer: "Within a week of closing the experiment, when results are still fresh in the team's memory. For long experiments, you can run an intermediate retrospective during execution." },
    { question: "What do you document in a retrospective?", answer: "You document: the original hypothesis, the actual result, the interpretation of what happened, the implications for the next experiments, and the open questions the experiment generated." },
    { question: "Why are retrospectives important?", answer: "Without retrospectives, the team repeats the same mistakes. With disciplined retrospectives, every experiment - even failed ones - generates net positive learning that accelerates future tests." },
  ],
  "growth-engineering-randomizzazione": [
    { question: "What is randomization in an experiment?", answer: "Randomization is the process by which each unit (user, session, device) is randomly assigned to a variant, ensuring that observed differences are due to the treatment and not to pre-existing factors." },
    { question: "Why is randomization important?", answer: "Without valid randomization, you cannot establish causality. Differences between variants could already exist before the test, making results uninterpretable." },
    { question: "What is an SRM (Sample Ratio Mismatch)?", answer: "An SRM occurs when the proportions of units assigned to each variant diverge significantly from the expected proportions (e.g. 50/50 for an A/A test). It is a symptom of a problem in the randomization system." },
    { question: "How do you verify randomization quality?", answer: "With an A/A test: you assign all units to the control variant and verify that metrics show no significant differences. If the A/A test flags differences, the randomization system has a problem." },
  ],
  "growth-engineering-pipeline-dati-growth": [
    { question: "What is a data pipeline for growth?", answer: "A data pipeline for growth is a sequence of transformations that turn raw data (clicks, events, transactions) into actionable insights (metrics, segments, experimentation)." },
    { question: "What is the difference between ETL and streaming pipelines?", answer: "ETL (Extract-Transform-Load) processes data in batches at defined intervals. Streaming pipelines process data event by event in real time. For growth engineering, the choice depends on how frequently decisions must be made." },
    { question: "Why is data quality fundamental for growth?", answer: "If data is dirty (duplicates, missing, inconsistent), metrics lie. Decisions made on low-quality data lead to ineffective experimentation and growth strategies based on spurious correlations." },
  ],
  "growth-engineering-osservabilita-prodotto": [
    { question: "What is product observability?", answer: "Product observability is the ability to infer the internal state of the system from its external outputs. In practice: user event data, performance metrics, and logs that let you understand what happens without reproducing the bug." },
    { question: "Why is observability important for growth?", answer: "Without observability, the growth team cannot distinguish between 'things work' and 'things seem to work'. Observability is a prerequisite for meaningful experimentation and for diagnosing the reasons behind test results." },
    { question: "What are the three pillars of observability?", answer: "The three pillars are: (1) metrics (aggregates showing trends), (2) traces (individual records of single events or sessions), (3) logs (discrete events capturing state transitions). Together they let you go from 'what' to 'why'." },
  ],
  "growth-engineering-ipotesi-buone": [
    { question: "What is a well-written growth hypothesis?", answer: "A growth hypothesis is a verifiable statement that links a specific action to a measurable result, with a rationale explaining the hypothesized causal mechanism." },
    { question: "Why are growth hypotheses important?", answer: "A well-made hypothesis makes the test decipherable: if the test fails, you understand why; if it works, you know what worked and what to replicate." },
    { question: "How do you write a growth hypothesis?", answer: "Three components: (1) the specific action the team will implement, (2) the measurable expected metric result, (3) the rationale explaining the causal mechanism. Formula: 'We believe [action] causes [result] because [mechanism]'." },
    { question: "What is the difference between a hypothesis and a wish?", answer: "A wish is 'we want more conversions'. A hypothesis is 'we believe adding a progress bar to checkout increases completion rate by 5% because it reduces uncertainty anxiety'." },
  ],
  "growth-engineering-human-in-the-loop": [
    { question: "What does human-in-the-loop mean for AI agents?", answer: "Human-in-the-loop (HITL) means the AI agent does not perform irreversible actions without human supervision. The human stays in the loop to approve, correct, or stop the agent at critical points in the process." },
    { question: "When is HITL necessary?", answer: "HITL is necessary when: (1) the action has irreversible consequences, (2) the cost of error is high, (3) the agent operates in a domain with complex policies, (4) the decision requires contextual judgment the agent cannot have." },
    { question: "How do you design an effective HITL system?", answer: "You identify the critical points where the agent must ask for confirmation, define clear criteria for when the human must intervene, and build an interface that allows rapid reviews without creating bottlenecks." },
  ],
  "growth-engineering-fake-door-etici": [
    { question: "What is a fake door test?", answer: "A fake door test is a technique where you present users with an option that seems available but does not actually exist yet, to measure demand before investing in building it." },
    { question: "Is the fake door test ethical?", answer: "The fake door test is ethical if: (1) the user pays nothing, (2) no sensitive personal data is collected, (3) the user receives an honest response when trying to access, (4) no deliberately frustrating experience is created." },
    { question: "When should you use a fake door test?", answer: "You use a fake door test when the cost of building and testing is high, when you want to validate demand before investing, and when the measurable outcome is simple (click, signup without purchase)." },
  ],
  "growth-engineering-eventi-che-contano": [
    { question: "How do you choose which events to track?", answer: "You choose events that correspond to user actions associated with business outcomes. Not every click deserves an event: only actions that contribute to defining whether the user is getting value from the product." },
    { question: "What is minimal telemetry?", answer: "Minimal telemetry is the smallest set of events that lets you answer the most important business questions. You reduce the tracking surface to the minimum necessary to make key decisions." },
    { question: "How many events should a tracking plan have?", answer: "Less is better. Every extra event is technical debt. Aim for 20-50 well-chosen events rather than hundreds of unrelated events. Add events only when a specific business question cannot be answered with existing ones." },
  ],
  "growth-engineering-dashboard-che-decidono": [
    { question: "What is a dashboard that decides?", answer: "A dashboard that decides does not just show numbers, but suggests actions based on data. It is not a passive monitoring tool, but an interface that connects every insight to a decision and a specific action." },
    { question: "Why are most dashboards not used?", answer: "Dashboards are ignored when they present too many metrics without priority, when it is unclear what to do with the shown data, or when the data is too outdated to support timely decisions." },
    { question: "How do you design an action-oriented dashboard?", answer: "Start from the decision the dashboard must support, then identify the metrics strictly necessary to make that decision, then organize them in a flow that guides the eye toward the action." },
  ],
  "growth-engineering-agenti-workflow": [
    { question: "Why do AI agents work better as workflows than as chat?", answer: "A workflow defines expected inputs, action sequences, success conditions, and verification points. A chat leaves the user free to say anything, without guaranteeing the agent receives the information needed to complete the task." },
    { question: "How do you design a workflow for an AI agent?", answer: "You define: (1) a verifiable final goal, (2) the sequence of steps the agent must follow, (3) the tools available for each step, (4) validation points where a person verifies the output before proceeding." },
    { question: "What does 'agentic workflow' mean in practice?", answer: "An agentic workflow is a process where the agent does not just respond, but performs actions: reads data, calls APIs, writes files, sends notifications, with a declared goal and explicit completion criteria." },
  ],
  "forecast-vendite": [
    { question: "What is an accurate sales forecast?", answer: "An accurate forecast has a low average error (low MAPE) and controlled bias (not systematically too optimistic or pessimistic). It is always evaluated on a holdout: data the model has never seen." },
    { question: "Which methods are used for sales forecasting?", answer: "Three families: classical statistical models (regression, moving average, exponential smoothing), seasonal models (ARIMA, seasonal decomposition), and machine learning models (XGBoost, LSTM) when there is a lot of data and complex patterns." },
    { question: "How do you handle a forecast with irregular data?", answer: "First identify the source of irregularity: if it is noise, filter it; if it is an event (promo, holiday), model it as a dummy variable. In case of uncertainty, use a confidence interval, not a single point estimate." },
  ],
  "esperimenti-prodotti-agentici": [
    { question: "What changes in experiments with AI agents?", answer: "AI agents introduce non-determinism: the same action can produce different outputs. This requires an outcome metric that captures the final value, not just the intermediate interaction." },
    { question: "How do you test an AI agent?", answer: "First define the verifiable outcome the agent must produce, then measure the percentage of times the agent achieves it, distinguishing between interaction (easy to measure) and outcome (harder but more relevant)." },
    { question: "Which metrics to use for AI agents?", answer: "You need outcome metrics (the final result for the user), guardrail metrics (side effects to avoid), and agent output quality metrics." },
    { question: "Why do vanity metrics not work for AI agents?", answer: "Metrics like 'number of interactions' or 'time on page' do not capture whether the agent actually solved the user's problem. More interactions can mean the agent was not clear." },
  ],
  "ecommerce-analytics": [
    { question: "What is the Cart Abandonment Rate (CAR)?", answer: "CAR is the percentage of carts that do not turn into orders. It is reduced with checkout optimization, reducing mandatory fields, and transparency on shipping costs from the start." },
    { question: "How do you calculate the LTV/CAC ratio?", answer: "LTV divided by CAC. A healthy ratio is 3:1. If it is lower, the business model does not scale. If it is higher, you are under-investing in growth." },
    { question: "What is the payback period?", answer: "The time needed to recover the CAC through margins. For a healthy e-commerce it should be under 12 months. The longer it is, the more cash is needed to grow." },
    { question: "How do you read an e-commerce analytics dashboard?", answer: "Look at three levels: revenue (total and per channel), margin (gross and per order), and risk (return rate, cart abandonment, stock). Every metric must lead to a specific decision." },
  ],
  "dati-sport-ciclismo": [
    { question: "What is the 'Moneyball' model applied to cycling?", answer: "It is the approach of using performance data (watt/kg power, VO2max, aerodynamic efficiency) to evaluate domestiques and captains, instead of trusting only the world ranking or reputation." },
    { question: "Which data matters in modern cycling?", answer: "Power output (watts), watt/kg ratio (determines climbing speed), aerodynamics (drag area), and recovery index (accumulated fatigue). This data now comes from sensors on the bike and body." },
    { question: "How is data used in a cycling team?", answer: "To optimize training, manage fatigue in races (pacing), and identify the specific strengths of each rider. Data does not replace talent, it amplifies it." },
  ],
  "data-driven-italia": [
    { question: "Why is Italy behind in data-driven decision making?", answer: "Because of a combination of culture (trust in experience more than data), infrastructure (scattered and low-quality data), and labor market (few well-paid data analyst roles). It is not just technology." },
    { question: "Which Italian sectors are more advanced?", answer: "E-commerce, gaming, and financial services are more advanced because data has always been central. Manufacturing and traditional retail are further behind because data was secondary until recently." },
    { question: "What is the first step for an Italian company?", answer: "Start from a concrete use case with already-available data, demonstrate a measurable result, and build the culture from there. Do not start from perfect infrastructure." },
    { question: "Is being data-driven in Italy a competitive advantage?", answer: "Yes, because few do it well. If you can be data-driven when the competition is not, you gain a decision margin the competition does not have." },
  ],
  "dashboard-che-nessuno-guarda": [
    { question: "Why are most dashboards not used?", answer: "Because they show too many metrics without priority, it is unclear what to do with the data, or the data is too outdated to support timely decisions. You ignore what does not lead to action." },
    { question: "What is an action-oriented dashboard?", answer: "A dashboard designed around a decision: it shows only the metrics needed for that decision, organized in the order that guides the eye toward the action." },
    { question: "How do you design a dashboard that decides?", answer: "Start from the decision it must support, identify the 3-5 strictly necessary metrics, define thresholds that trigger specific actions, and organize in a clear flow. If it does not lead to a decision, it is decoration." },
  ],
  "cluster-analysis": [
    { question: "What is clustering?", answer: "Clustering groups similar elements together without knowing the labels in advance. For example, it groups customers by behavior (frequency, value, channel) to identify natural segments." },
    { question: "How do you choose the number of clusters K?", answer: "With the Elbow Method (drop in inertia), with the Silhouette Score (group coherence), or with domain knowledge. There is no 'right' number - there is the number that best answers the question." },
    { question: "What is the most common mistake?", answer: "Not standardizing the variables. If one variable has a scale from 0 to 1000 and another from 0 to 1, the first dominates the distance. Variables must be scaled before clustering." },
    { question: "What do you do after clustering?", answer: "You assign a descriptive name to each cluster (e.g. 'high-value loyalists'), calculate the size and value of each group, and decide the strategy for each. Clustering is not the end: it is the beginning of the strategy." },
  ],
  "capire-boxplot": [
    { question: "When should you use a boxplot?", answer: "When you want to understand the distribution of a variable: median, spread, outliers. It is more informative than the mean because it shows whether data is symmetric, skewed, or has extreme values." },
    { question: "How do you read a boxplot?", answer: "The box shows the central 50% of the data (Q1 to Q3). The inner line is the median. The whiskers extend to non-outlier values. The outer points are outliers to investigate." },
    { question: "What is the most common mistake with boxplots?", answer: "Interpreting the median as the mean. In a skewed boxplot, median and mean diverge. If data is asymmetric, the mean is often misleading." },
    { question: "Boxplot vs histogram: when one and when the other?", answer: "Histogram: to see the shape of the distribution. Boxplot: to quickly compare the distribution between groups (e.g. sales by channel). They are often used together." },
  ],
  "analytic-traps": [
    { question: "What is an analytical trap?", answer: "A pattern that looks like an insight but is an artifact of the measurement method. Examples: correlation confused with causation, survivorship bias, distorted sampling, outliers that distort the mean." },
    { question: "How do you avoid survivorship bias?", answer: "By including failed cases in the analysis, not just successes. If you only study the customers who stayed, you do not see how many left and why. The complete dataset includes those who exited." },
    { question: "What is outlier bias?", answer: "The bias generated when an outlier (a very large customer, an atypical event) distorts the mean. The median is more robust than the mean in the presence of outliers." },
    { question: "How do you verify whether a pattern is real?", answer: "With a temporal check: is the pattern stable over multiple periods? With a geographic check: is it present in multiple segments? If the pattern appears only in a small subset, it is probably noise." },
  ],
  "ai-marketing-2026": [
    { question: "What are the application areas of AI in marketing?", answer: "Five areas: attribution modeling (data-driven), audience targeting (predictive), personalization (recommendation), content generation (production), and campaign optimization (bidding, budget, channel mix)." },
    { question: "Does AI in marketing replace the marketing analyst?", answer: "No, it empowers them. AI automates the mechanical part (data, reports, basic targeting) but does not replace strategic judgment: understanding the business, interpreting results in context, and deciding what to do next." },
    { question: "How do you evaluate whether marketing AI works?", answer: "You compare performance with and without AI: CPA (cost per acquisition), ROAS (return on ad spend), and time needed to produce a campaign. If AI does not improve these numbers, it is not adding value." },
  ],
  "agenti-ai-non-sono-chatbot": [
    { question: "What is the difference between an AI agent and a chatbot?", answer: "A chatbot answers a specific question in a conversation. An AI agent has a long-term goal, uses tools to perform actions, maintains context memory, and autonomously decides when to complete a task or ask for confirmation." },
    { question: "What makes an AI agent different from traditional automation?", answer: "Traditional automation follows fixed rules. An AI agent can handle unexpected inputs, make contextual inferences, and adapt its behavior based on what it learns during execution." },
    { question: "When does it make sense to build an AI agent instead of a chatbot?", answer: "When you need to complete multi-step tasks that require the use of tools (database, APIs, filesystem), maintain cross-cutting memory, or handle use cases that do not lend themselves to predefined scripts." },
    { question: "What are the specific risks of AI agents?", answer: "Risks include: irreversible actions executed without confirmation, progressive quality degradation, exploitation of permissive instructions, and state accumulation that creates undocumented dependencies." },
  ],
  "abbandono-universitario": [
    { question: "What is the dropout rate in Italy?", answer: "15-20% of students drop out after the first year. ISTAT and Anvur data show strong geographic and institutional differences. The estimated cost is hundreds of millions of euros per year in lost fees and unused resources." },
    { question: "What are the predictive factors of dropout?", answer: "First-semester CFU (credits) are the strongest predictor: fewer CFU -> higher dropout probability. But exam pass rate, home-university distance, and socioeconomic background also matter." },
    { question: "How do you reduce dropout?", answer: "With proactive interventions on weak signals: fewer CFU than expected in the first semester, low attendance, declining grades. The model is 'early alert + targeted support', not 'waiting for the student to ask for help'." },
  ],
  "ab-test-errori": [
    { question: "What is the most common mistake in A/B tests?", answer: "Stopping the test too early when you see a result. Statistical significance requires time: stopping halfway leads to random results that vanish in the long term." },
    { question: "What is 'peeking'?", answer: "Peeking is looking at results before the test concludes. It distorts significance and leads to false conclusions. The correct way is to fix the duration before starting and not look until it ends." },
    { question: "How many variants can you test simultaneously?", answer: "It depends on the metric variance and test power. With many variants you need more data to maintain statistical power. As a rule, more variants = more time or more traffic for reliable results." },
    { question: "What is the MDE?", answer: "MDE (Minimum Detectable Effect) is the minimum effect size the test can detect with the set statistical power. If the MDE is 5% and the true effect is 2%, the test will not see it." },
  ],
};

async function main() {
    const slugs = Object.keys(translations);
    let injected = 0;
    let skipped = 0;

    for (const slug of slugs) {
        const enPath = `src/content/blog-en/${slug}.mdx`;
        let raw: string;
        try {
            raw = await fs.readFile(enPath, "utf-8");
        } catch {
            console.log(`SKIP ${slug} (no EN mirror)`);
            skipped++;
            continue;
        }

        if (raw.includes("faqSchema:")) {
            console.log(`SKIP ${slug} (already has faqSchema)`);
            skipped++;
            continue;
        }

        const faqs = translations[slug];
        const faqYaml = faqs
            .map((f) => `  - question: "${f.question}"\n    answer: "${f.answer}"`)
            .join("\n");

        // Insert faqSchema before the closing "---" of the frontmatter.
        // The frontmatter ends at the first "---" line that is at the start of a line (index 0 is the opening).
        const lines = raw.split("\n");
        const closingIdx = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
        if (closingIdx === -1) {
            console.log(`SKIP ${slug} (no closing ---)`);
            skipped++;
            continue;
        }

        const newLines = [
            ...lines.slice(0, closingIdx),
            "faqSchema:",
            faqYaml,
            ...lines.slice(closingIdx),
        ];

        await fs.writeFile(enPath, newLines.join("\n"), "utf-8");
        console.log(`INJECTED ${slug} (${faqs.length} FAQs)`);
        injected++;
    }

    console.log(`\nDone: ${injected} injected, ${skipped} skipped`);
}

main().catch(console.error);
