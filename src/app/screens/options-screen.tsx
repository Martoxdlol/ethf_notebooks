export function OptionsScreen() {
    const linkClassName = 'shrink-0 gap-4 flex border-b px-4 py-2'

    // yyyy-mm-dd
    const today = new Date().toISOString().split('T')[0]

    return (
        <>
            <a href='/api/etiquetas.pdf' className={linkClassName}>
                Imprimir etiquetas
            </a>
            <a href={`/api/reservas/reservas-notebooks-${today}.pdf`} className={linkClassName}>
                Imprimir reservas de hoy
            </a>
            <a href='https://inventario.henryford.edu.ar' className={linkClassName}>
                Inventario ETHF
            </a>
        </>
    )
}
