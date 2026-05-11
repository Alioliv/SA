import RegisterUser from '../../components/RegisterUser/RegisterUser'
import styles from './Register.module.css'

export default function Register() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <div className={styles.header}>
          <div className={styles.logo}>L</div>
          <h1>Loja</h1>
        </div>

        <p className={styles.subtitulo}>Crie sua conta</p>

        <RegisterUser />

      </div>
    </div>
  )
}