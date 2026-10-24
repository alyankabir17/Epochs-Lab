function DatasetPreview() {
  return (
    <div className="mini-preview" style={{ '--agent-color': '#3b5bff' }} aria-label="Ranked dataset preview">
      {[['Bank Customer Churn', 'Kaggle', 'strong'], ['churn-credit-card', 'HuggingFace', 'medium'], ['Telecom churn', 'Kaggle', 'short']].map(([name, source, width]) => (
        <div className="mini-row" key={name}>
          <span className="mini-dot" />
          <span className={`mini-line ${width}`} />
          <span className="mini-tag">{source}</span>
        </div>
      ))}
    </div>
  )
}

function CleaningPreview() {
  return (
    <div className="mini-preview" style={{ '--agent-color': '#13b58c' }} aria-label="Cleaning plan preview">
      {['Fill missing values', 'Encode categories', 'Split train and test'].map((label) => (
        <div className="mini-row" key={label}>
          <span className="mini-check">✓</span>
          <span className="mini-line medium" />
          <span className="sr-only">{label}</span>
        </div>
      ))}
    </div>
  )
}

function ModelPreview() {
  return (
    <div className="mini-preview" style={{ '--agent-color': '#f5a524' }} aria-label="Model comparison preview">
      {[['Gradient boosting', '82%'], ['Random forest', '68%'], ['Logistic regression', '51%']].map(([label, fit]) => (
        <div className="mini-row" key={label}>
          <span className="mini-line short" />
          <span className="mini-bar" style={{ '--fit': fit }} />
        </div>
      ))}
    </div>
  )
}

function TrainingPreview() {
  return (
    <div className="mini-preview" style={{ '--agent-color': '#ff6b57' }} aria-label="Training loss preview">
      <div className="mini-chart" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="flex items-center justify-between text-[10px] font-semibold text-soft"><span>loss 0.318</span><span>epoch 20</span></div>
    </div>
  )
}

function EvaluationPreview() {
  return (
    <div className="mini-preview grid grid-cols-2 gap-2" style={{ '--agent-color': '#8b5cf6' }} aria-label="Evaluation metrics preview">
      {[['Accuracy', '86.4%'], ['Precision', '0.79'], ['Recall', '0.52'], ['F1', '0.63']].map(([label, value]) => (
        <div className="rounded-lg bg-wash px-2 py-2" key={label}>
          <p className="font-display text-base font-bold text-navy">{value}</p>
          <p className="mt-0.5 text-[10px] font-semibold text-soft">{label}</p>
        </div>
      ))}
    </div>
  )
}

function ExportPreview() {
  return (
    <div className="mini-preview" style={{ '--agent-color': '#18b4e8' }} aria-label="Export file tree preview">
      {['model.pkl', 'notebook.ipynb', 'inference.py', 'requirements.txt', 'README.md'].map((file) => <div className="mini-file" key={file}>{file}</div>)}
    </div>
  )
}

export default function AgentPreview({ id }) {
  const previews = { data: DatasetPreview, prep: CleaningPreview, model: ModelPreview, train: TrainingPreview, eval: EvaluationPreview, export: ExportPreview }
  const Preview = previews[id]
  return Preview ? <Preview /> : null
}
