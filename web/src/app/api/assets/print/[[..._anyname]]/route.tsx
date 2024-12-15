import { Document, Image, Link, Page, Text, View, renderToStream } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import { fetchInventory } from '~/lib/inventario'

export async function GET() {
    const hardware = await fetchInventory('/hardware')

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const assets: Asset[] = hardware.rows.map((h: any) => ({
        qrSrc: QRCode.toDataURL(h.asset_tag, {
            errorCorrectionLevel: 'medium',
            margin: 0,
            rendererOpts: { quality: 1 },
        }),
        tag: h.asset_tag,
        serial: h.serial,
        model: h.model.name,
    }))

    const r: ReadableStream = (await renderToStream(<MyDocument assets={assets} />)) as unknown as ReadableStream

    return new Response(r)
}

export type Asset = {
    tag: string
    qrSrc: string
    serial: string
    model: string
}

function AssetSection(props: Asset) {
    return (
        <View
            style={{
                width: '105mm',
                height: '60mm',
                flexDirection: 'row',
                border: '0.5mm',
                borderStyle: 'dashed',
                borderColor: '#888888',
            }}
        >
            <View style={{ padding: '4mm', position: 'relative', flexDirection: 'row', gap: '5mm' }}>
                <Image src={props.qrSrc} style={{ width: '50mm', height: '50mm' }} />
                <View>
                    <Text style={{ fontSize: '4mm' }}>Nombre</Text>
                    <Text>{props.tag}</Text>
                    <Text style={{ marginTop: '2mm', fontSize: '4mm' }}>Serial</Text>
                    <Text>{props.serial}</Text>
                    <Text style={{ marginTop: '2mm', fontSize: '4mm' }}>Modelo</Text>
                    <Text>{props.model}</Text>
                    <Link
                        src='https://www.henryford.edu.ar'
                        style={{ marginTop: '2mm', fontSize: '4mm', justifyContent: 'center', color: '#000000' }}
                    >
                        www.henryford.edu.ar
                    </Link>
                    <Link
                        src='tel:+541163929190'
                        style={{ fontSize: '4mm', justifyContent: 'center', color: '#000000' }}
                    >
                        11 6392-9190
                    </Link>
                </View>
            </View>
        </View>
    )
}

function splitIntoChunks<T>(arr: T[], chunkSize: number): T[][] {
    const res: T[][] = []
    for (let i = 0; i < arr.length; i += chunkSize) {
        res.push(arr.slice(i, i + chunkSize))
    }
    return res
}

function MyDocument(props: { assets: Asset[] }) {
    const chunks = splitIntoChunks(props.assets, 2)

    return (
        <Document>
            <Page size='LETTER' style={{ padding: 5 }}>
                {chunks.map((chunk, i) => (
                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        {chunk.map((asset, j) => (
                            <AssetSection key={j} {...asset} />
                        ))}
                    </View>
                ))}
            </Page>
        </Document>
    )
}
