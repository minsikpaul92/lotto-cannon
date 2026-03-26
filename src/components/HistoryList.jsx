import { motion, AnimatePresence } from 'framer-motion'

export default function HistoryList({ history, getBallColor }) {
  return (
    <div className="history-panel">
      <div className="history-title">📋 History</div>
      {history.length === 0 ? (
        <div className="history-empty">No picks yet</div>
      ) : (
        history.map((num, idx) => {
          return (
            <motion.div
              key={num}
              className="history-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0, duration: 0.3 }}
            >
              <span className="history-index">{idx + 1}.</span>
              <span
                className="history-num"
                style={{ color: getBallColor(num) }}
              >
                {num}
              </span>
            </motion.div>
          )
        })
      )}
    </div>
  )
}
