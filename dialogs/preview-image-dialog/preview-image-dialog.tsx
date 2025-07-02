import * as React from "react";
import './PreviewImageDialog.css';

export default function PreviewImageDialog({imgUrl}) {
    return (
        <div className={'PreviewImageDialog'}>
            <img
                srcSet={imgUrl}
                src={imgUrl}
                alt={''}
                loading="lazy"
            />
        </div>
    )
}
