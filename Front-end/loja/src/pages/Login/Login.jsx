import LoginForm from '../../components/LoginForm/LoginForm'
import styles from './Login.module.css'

export default function Login() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <div className={styles.header}>
          <div className={styles.logo}>L</div>
          <h1>Loja</h1>
        </div>

        <p className={styles.subtitulo}>Acesse sua conta</p>

        <LoginForm />

      </div>
    </div>
  )
}