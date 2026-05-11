import { useEffect } from 'react'
import styles from './Modal.module.css'

export default function Modal({ title, onClose, children }) {
  // Fecha com ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>

        {/* Cabeçalho */}
        <div className={styles.header}>
          <h3 className={styles.titulo}>{title}</h3>
          <button
            className={styles.btnFechar}
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo */}
        <div className={styles.body}>
          {children}
        </div>

      </div>
    </div>
  )
}