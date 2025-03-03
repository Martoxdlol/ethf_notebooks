import { Document, Image, Link, Page, Text, View, renderToStream } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import { listHardware } from './inventory'

export async function responsePrintTags() {
    const hardware = await listHardware()

    const assets: Asset[] = await Promise.all(
        hardware.rows.map(
            async (h) =>
                ({
                    qrSrc: await QRCode.toDataURL(h.asset_tag, {
                        errorCorrectionLevel: 'medium',
                        margin: 0,
                        rendererOpts: { quality: 1 },
                    }),
                    model: h.model.name,
                    serial: h.serial,
                    tag: h.asset_tag,
                }) satisfies Asset,
        ),
    )

    assets.sort((a, b) => a.tag.localeCompare(b.tag))

    const r: ReadableStream = (await renderToStream(<MyDocument assets={assets} />)) as unknown as ReadableStream

    return new Response(r, {
        headers: {
            'Content-Type': 'application/pdf',
        },
    })
}

export type Asset = {
    tag: string
    qrSrc: string
    serial: string
    model: string
}

function AssetSection(props: Asset & { xIndex: number; yIndex: number }) {
    return (
        <View
            style={{
                flex: 1,
                flexDirection: 'row',
                borderLeft: props.xIndex % 2 === 1 ? 1 : undefined,
                borderBottom: props.yIndex % 5 !== 3 ? 1 : undefined,
                borderStyle: 'dashed',
                borderColor: '#888888',
            }}
        >
            <View style={{ padding: '4mm', position: 'relative', flexDirection: 'row', gap: '5mm' }}>
                <Image src={props.qrSrc} style={{ width: '45mm', height: '45mm' }} />
                <View>
                    <Text style={{ fontSize: '4mm' }}>Nombre</Text>
                    <Text style={{ fontSize: '6mm' }}>{props.tag}</Text>
                    <Text style={{ marginTop: '1mm', fontSize: '4mm' }}>Serial</Text>
                    <Text style={{ fontSize: '6mm' }}>{props.serial}</Text>
                    <Text style={{ marginTop: '1mm', fontSize: '4mm' }}>Modelo</Text>
                    <Text style={{ fontSize: '6mm' }}>{props.model}</Text>
                    <Link
                        src='https://www.henryford.edu.ar'
                        style={{ marginTop: '1mm', fontSize: '4mm', justifyContent: 'center', color: '#000000' }}
                    >
                        www.henryford.edu.ar
                    </Link>
                    <Link src='tel:+541163929190' style={{ fontSize: '4mm', justifyContent: 'center', color: '#000000' }}>
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
    const elements: (Asset | undefined)[] = props.assets
    if (elements.length % 2 === 1) {
        elements.push(undefined)
    }

    const chunks = splitIntoChunks(elements, 2)
    const pages = splitIntoChunks(chunks, 4)

    return (
        <Document>
            {pages.map((chunks, i) => (
                <Page key={i} size='LETTER' style={{ padding: '8mm' }}>
                    <View
                        style={{
                            borderStyle: 'dashed',
                            borderColor: '#888888',
                            borderWidth: 1,
                        }}
                    >
                        {chunks.map((chunk, i) => (
                            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                {chunk.map((asset, j) =>
                                    asset ? (
                                        <AssetSection key={j} xIndex={j} yIndex={i} {...asset} />
                                    ) : (
                                        <View key={j} style={{ flex: 1, borderLeft: 1, borderStyle: 'dashed', borderColor: '#888888' }} />
                                    ),
                                )}
                            </View>
                        ))}
                    </View>
                </Page>
            ))}
        </Document>
    )
}
