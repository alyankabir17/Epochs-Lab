export const AGENTS = [
  { id: 'prompt', name: 'Prompt Analysis', short: 'Prompt', color: '#7c3aed', text: '#6d28d9',
    blurb: 'Reads the goal, identifies the prediction task, and turns the request into an execution plan.',
    output: 'Task type and execution plan', gate: null },
  { id: 'dataset', name: 'Dataset Search', short: 'Dataset', color: '#3b5bff', text: '#2f4bd8',
    blurb: 'Finds datasets on Kaggle and HuggingFace, ranks them against your goal, or uses the CSV you upload.',
    output: 'Ranked dataset candidates', gate: 'Choose a dataset' },
  { id: 'profile', name: 'Data Profiling', short: 'Profile', color: '#0ea5a4', text: '#087f7d',
    blurb: 'Profiles rows, columns, missing values, class balance, and potential data quality risks.',
    output: 'Dataset profile and quality notes', gate: null },
  { id: 'prep', name: 'Preprocessing', short: 'Prep', color: '#13b58c', text: '#0e9c78',
    blurb: 'Proposes a cleaning plan with a reason for every step, then runs it and checks the result.',
    output: 'Clean training data', gate: 'Approve the preprocessing plan' },
  { id: 'train', name: 'Model Training', short: 'Training', color: '#ff6b57', text: '#f0503a',
    blurb: 'Selects a strong baseline and trains it inside your project sandbox while streaming progress.',
    output: 'Trained model and checkpoint', gate: null },
  { id: 'eval', name: 'Evaluation', short: 'Evaluate', color: '#8b5cf6', text: '#7a45f0',
    blurb: 'Scores the model against the held-out data and checks it against the goal you provided.',
    output: 'Metrics and evaluation charts', gate: null },
  { id: 'report', name: 'Report', short: 'Report', color: '#18b4e8', text: '#0e9bcb',
    blurb: 'Packages the notebook, model, preprocessing steps, and results into a reusable report.',
    output: 'Export-ready report archive', gate: null },
]

export const COMPARE = [
  { name: 'Amazon SageMaker Autopilot', good: 'Mature, scalable, automated preprocessing and tuning.', gap: 'No natural-language input, no automatic debugging, lots of manual setup.' },
  { name: 'Google Vertex AI AutoML', good: 'Tight Google ecosystem fit and strong model selection.', gap: 'Limited agent reasoning, only partial automation, no human approval steps.' },
  { name: 'H2O AutoML', good: 'Open source with good model comparison and leaderboards.', gap: 'No dataset discovery, no notebook output, limited error handling.' },
  { name: 'Epochs Lab', good: 'Whole pipeline from a plain-English goal, approval at every key decision, notebook output, automatic error repair.', gap: 'Tabular CSV data only, and larger models need a cloud GPU.', us: true },
]

export const SEED_PROJECTS = [
  { id: 'p1', name: 'Customer churn', goal: 'Predict whether a bank customer will leave, from account history. Aim for accuracy above 85%.',
    done: 3, status: 'waiting', gate: 'Approve the preprocessing plan', updated: '12 min ago' },
  { id: 'p2', name: 'House prices', goal: 'Estimate the sale price of a house from its size, location and age.',
    done: 5, status: 'running', gate: null, updated: 'Just now' },
  { id: 'p3', name: 'Loan approval', goal: 'Predict loan approval from applicant income and credit history.',
    done: 7, status: 'done', gate: null, updated: 'Yesterday', metric: 'F1 0.91' },
]

export const EXAMPLE_PROJECTS = [
  { name: 'Customer churn', goal: 'Predict whether a customer will cancel their subscription from account history. Aim for accuracy above 85%.' },
  { name: 'House prices', goal: 'Estimate the sale price of a house from its size, location and age.' },
  { name: 'Loan approval', goal: 'Predict loan approval from applicant income, credit history and current debt.' },
]

export const ACTIVITY = [
  { id: 'a1', projectId: 'p2', agent: 'prep', text: 'Preprocessing finished on House prices', time: '2 min ago' },
  { id: 'a2', projectId: 'p3', agent: 'report', text: 'Report ready for Loan approval', time: 'Yesterday' },
  { id: 'a3', projectId: 'p1', agent: 'prep', text: 'Preprocessing plan ready on Customer churn', time: '12 min ago' },
  { id: 'a4', projectId: 'p1', agent: 'profile', text: 'Dataset profile created for Customer churn', time: '42 min ago' },
]

/* ------------ scripted run used by the pipeline prototype ------------ */
const epochs = Array.from({ length: 20 }, (_, i) => {
  const e = i + 1
  const loss = +(0.62 * Math.exp(-e / 7) + 0.31 + Math.sin(e * 1.7) * 0.012).toFixed(3)
  const acc = +(0.71 + 0.155 * (1 - Math.exp(-e / 6)) + Math.sin(e * 1.3) * 0.004).toFixed(3)
  return { t: 280, loss, acc, log: e % 5 === 0 || e === 1 ? `Epoch ${e}/20, loss ${loss}, accuracy ${acc}` : null }
})

export const STAGES = [
  { // prompt
    pre: [
      { t: 650, log: 'Reading the goal and identifying the prediction task', cell: { kind: 'code', text: "goal = 'Predict whether a bank customer will leave'\ntask = classify(goal)" } },
      { t: 650, log: 'Plan ready: binary classification on tabular data', cell: { kind: 'out', text: 'task: classification\ntarget: customer churn\nmetric: accuracy + F1' } },
    ],
    post: [],
  },
  { // dataset
    pre: [
      { t: 700, log: 'Searching Kaggle and HuggingFace' },
      { t: 1200, log: 'Found 6 candidates, ranked by fit to your goal' },
    ],
    gate: {
      title: 'Choose a dataset', body: 'These three fit your goal best. Pick one, or upload your own CSV.',
      options: [
        { id: 'a', label: 'Bank Customer Churn', meta: 'Kaggle · 10,000 rows · 14 columns · best match' },
        { id: 'b', label: 'churn-credit-card', meta: 'HuggingFace · 8,500 rows · 19 columns' },
        { id: 'c', label: 'Upload my own CSV', meta: 'Skips the search' },
      ],
      cta: 'Use this dataset',
    },
    post: [
      { t: 800, log: 'Downloading dataset', cell: { kind: 'code', text: "import pandas as pd\ndf = pd.read_csv('data/bank_churn.csv')\ndf.shape" } },
      { t: 700, cell: { kind: 'out', text: '(10000, 14)' } },
    ],
  },
  { // profile
    pre: [
      { t: 700, log: 'Profiling rows, columns, missing values, and class balance', cell: { kind: 'code', text: "profile = inspect(df)\nprofile.missing\nprofile.target_balance" } },
      { t: 800, log: 'Profile ready: 2 columns with missing values, 20% of customers left', cell: { kind: 'md', text: '**Profile.** 10,000 customers, 14 columns. `Age` and `Balance` have gaps. About 20% of customers churned, so the classes are uneven.' } },
    ],
    post: [],
  },
  { // preprocessing
    pre: [
      { t: 900, log: 'Reading the profile and drafting a preprocessing plan' },
    ],
    gate: {
      title: 'Approve the preprocessing plan', body: 'Each step comes with a reason. Send it back with a comment if you want something changed.',
      plan: [
        ['Fill missing Age and Balance with the median', 'Median is not thrown off by a few very large balances.'],
        ['Encode Geography and Gender', 'Models need numbers, not text.'],
        ['Scale numeric columns', 'Keeps large values like Balance from dominating.'],
        ['Drop duplicate rows', 'Repeated rows would leak into the test set.'],
        ['Split 80% train, 20% test', 'Keeps data the model has never seen for scoring.'],
      ],
      cta: 'Approve preprocessing',
    },
    post: [
      { t: 900, log: 'Running the approved plan', cell: { kind: 'code', text: "X = df.drop(columns=['Exited'])\nX['Geography_enc'] = enc.fit_transform(X[['Geography']])\nX_train, X_test, y_train, y_test = train_test_split(X, df['Exited'], test_size=0.2)" } },
      { t: 900, log: 'Code failed: column not found', cell: { kind: 'error', text: "KeyError: 'Geography_enc'" }, repair: 1 },
      { t: 1100, log: 'Fix attempt 1 of 3: re-read the data profile, corrected the column name', cell: { kind: 'code', text: "enc_cols = enc.fit_transform(X[['Geography']])\nX = X.join(pd.DataFrame(enc_cols, index=X.index))\nX_train, X_test, y_train, y_test = train_test_split(X, df['Exited'], test_size=0.2)" } },
      { t: 800, log: 'Fixed. Shape check passed', cell: { kind: 'out', text: 'train (8000, 13)   test (2000, 13)   ✓ validation passed' }, repair: 0 },
    ],
  },
  { // training
    pre: [
      { t: 700, log: 'Comparing model baselines against dataset size and class balance', cell: { kind: 'md', text: '**Model.** Gradient boosting selected automatically because the data is tabular and the classes are uneven.' } },
      { t: 500, log: 'Training started', cell: { kind: 'code', text: "model = GradientBoostingClassifier(n_estimators=20, learning_rate=0.1, max_depth=4)\nmodel.fit(X_train, y_train)" } },
      ...epochs,
      { t: 400, log: 'Training finished, best checkpoint saved', cell: { kind: 'out', text: 'best epoch 20   loss 0.318   accuracy 0.865' } },
    ],
    post: [],
  },
  { // evaluation
    pre: [
      { t: 900, log: 'Scoring on the held-out test set', cell: { kind: 'code', text: "print(classification_report(y_test, model.predict(X_test)))" } },
      { t: 900, cell: { kind: 'out', text: 'accuracy   0.864\nprecision  0.79\nrecall     0.52\nf1         0.63' }, log: 'Accuracy 86.4%, above your 85% target' },
    ],
    post: [],
  },
  { // report
    pre: [
      { t: 800, log: 'Writing inference.py and requirements.txt' },
      { t: 900, log: 'Writing README and saving charts' },
      { t: 900, log: 'Report ready: churn-model.zip (4.2 MB)' },
    ],
    post: [],
  },
]

export const ARTIFACTS = [
  ['churn-model.zip', '4.2 MB', 'Everything below in one download'],
  ['notebook.ipynb', '312 KB', 'The whole run, including failed attempts'],
  ['model.pkl', '1.1 MB', 'Trained model'],
  ['preprocessor.pkl', '18 KB', 'Fitted cleaning steps'],
  ['inference.py', '2 KB', 'Loads both and exposes predict()'],
  ['requirements.txt', '1 KB', 'Exact package versions used'],
  ['README.md', '3 KB', 'What was run and how to use it'],
]

export const DATASET_PROFILE = {
  name: 'Bank Customer Churn', provider: 'Kaggle', rows: '10,000', columns: '14',
  missing: [['Age', '2.1%'], ['Balance', '1.4%'], ['Tenure', '0%']],
  balance: [['Stayed', '80%', '#3b5bff'], ['Churned', '20%', '#ff6b57']],
  rowsPreview: [
    ['15634602', '42', 'France', '85,000', '0'],
    ['15647311', '41', 'Spain', '143,000', '1'],
    ['15619304', '39', 'France', '76,000', '0'],
    ['15701354', '31', 'Germany', '94,000', '1'],
    ['15737888', '44', 'France', '125,000', '0'],
  ],
}

export const MODEL_COMPARISON = [
  { id: 'a', name: 'Gradient boosting', fit: 'Strong', accuracy: '86.4%', time: '38s', reason: 'Handles tabular data and uneven classes well.' },
  { id: 'b', name: 'Random forest', fit: 'Good', accuracy: '83.8%', time: '52s', reason: 'Steady baseline with less tuning.' },
  { id: 'c', name: 'Logistic regression', fit: 'Baseline', accuracy: '78.6%', time: '4s', reason: 'Fast and easy to explain.' },
]

export const PRICING_PLANS = [
  {
    id: 'sandbox',
    name: 'Sandbox',
    monthly: 0,
    yearly: 0,
    label: 'For trying the workflow',
    description: 'Explore the path from dataset to trained model with no setup overhead.',
    workspace: '1 workspace · 3 active projects',
    cta: 'Start building',
    features: [
      { label: 'CSV, Kaggle and HuggingFace sources', included: true },
      { label: 'Dataset profiling and preview', included: true },
      { label: 'Preprocessing and model approvals', included: true },
      { label: 'Notebook and artifact preview', included: true },
      { label: 'Notebook Copilot', included: false },
    ],
  },
  {
    id: 'builder',
    name: 'Builder',
    monthly: 19,
    yearly: 182,
    label: 'For individual experiments',
    description: 'Run more experiments, compare results, and keep every decision in context.',
    workspace: '1 workspace · 10 active projects',
    cta: 'Start experimenting',
    features: [
      { label: 'Everything in Sandbox', included: true },
      { label: 'Run history and model comparison', included: true },
      { label: 'Self-healing execution attempts', included: true },
      { label: 'Multiple AI provider options', included: true },
      { label: 'Notebook Copilot', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 49,
    yearly: 470,
    label: 'For serious ML work',
    description: 'Move from promising runs to repeatable, export-ready machine learning workflows.',
    featured: true,
    workspace: 'Unlimited project history · priority execution',
    cta: 'Start with Pro',
    features: [
      { label: 'Everything in Builder', included: true },
      { label: 'Notebook Copilot after every run', included: true },
      { label: 'Detailed evaluation metrics', included: true },
      { label: 'Export-ready model packages', included: true },
      { label: 'Priority support', included: true },
    ],
  },
  {
    id: 'team',
    name: 'Team',
    monthly: 99,
    yearly: 950,
    label: 'For shared ML work',
    description: 'Give your team one place to review data, approve decisions, and share results.',
    workspace: 'Shared workspace · role-based approvals',
    cta: 'Talk to the team',
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'Shared datasets and project history', included: true },
      { label: 'Approvals by role', included: true },
      { label: 'Custom execution support', included: true },
      { label: 'Dedicated support', included: true },
    ],
  },
]

export const ERROR_STRATEGIES = [
  ['Out of memory', 'Use a smaller batch or switch to CPU'],
  ['Shape mismatch', 'Check dimensions and align the feature matrix'],
  ['Undefined loss', 'Lower the learning rate or clip gradients'],
  ['Missing module', 'Install the package in the sandbox'],
  ['Invalid argument', 'Match the installed package version'],
  ['Column not found', 'Re-read the dataset profile'],
  ['Convergence warning', 'Run more iterations or scale features'],
  ['Timeout', 'Split the cell into smaller steps'],
]
