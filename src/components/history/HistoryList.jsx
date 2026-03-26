// =============================================================================
// HistoryList Component
// Displays the history of picked numbers gracefully.
// =============================================================================

import { motion } from 'framer-motion'
import { getBallColor } from '../../constants/index.js'
import styles from './HistoryList.module.css'

export default function HistoryList({ history }) {
  return (
    <div className={styles.panel}>
      <div className={styles.title}>📋 History</div>
      
      {history.length === 0 ? (
        <div className={styles.empty}>No picks yet</div>
      ) : (
        // Renders the history sequentially where newer items appear at the bottom.
        history.map((num, idx) => {
          return (
            <motion.div
              key={num}
              className={styles.item}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0, duration: 0.3 }}
            >
              <span className={styles.index}>{idx + 1}.</span>
              <span
                className={styles.num}
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
