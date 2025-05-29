import React from "react";

import { QRCodeCanvas } from "qrcode.react";

export type QRCodeProps = React.ComponentProps<typeof QRCodeCanvas>;

export const QRCode: React.FC<QRCodeProps> = (props) => {
	return <QRCodeCanvas {...props} />;
};
