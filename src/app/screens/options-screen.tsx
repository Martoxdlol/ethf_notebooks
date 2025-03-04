import { Link } from 'react-router'

export function OptionsScreen() {
    const linkClassName = 'shrink-0 gap-4 flex border-b'

    // yyyy-mm-dd
    const today = new Date().toISOString().split('T')[0]

    return (
        <>
            <Link to='/api/etiquetas.pdf' className={linkClassName}>
                Imprimir etiquetas
            </Link>
            <Link to={`/api/reservas/reservas-notebooks-${today}.pdf`} className={linkClassName}>
                Imprimir reservas de hoy
            </Link>
            <a href='https://inventario.henryford.edu.ar' className={linkClassName}>
                Inventario ETHF
            </a>
        </>
    )
}
