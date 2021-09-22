import React, { useCallback, useState } from 'react';
import { ResourceItem, ResourceList } from '@shopify/polaris';

export default function NFTList(props) {

    return (
        <ResourceList
            items={props.myNFTs}
            renderItem={(item) => {
                return (
                    <ResourceItem>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            <img
                                src={`https://ipfs.io/ipfs/${item.image.split("ipfs://")[1]}`}
                                alt={item.name}
                                width="auto" height="50px"
                            />
                            <div style={{ margin: '5px' }}></div>
                            <div style={{ textAlign: 'left' }}>
                                <p>title: {item.name}</p>
                                <p>description: {item.description}</p>
                            </div>
                        </div>
                    </ResourceItem>);
            }}
        />
    );
}
