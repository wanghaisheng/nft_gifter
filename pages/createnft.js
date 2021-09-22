import React from "react";
import { Page, Card, TextField, FormLayout, Button, Thumbnail, InlineError, Modal } from "@shopify/polaris";
import { ResourcePicker } from '@shopify/app-bridge-react';
import _ from "lodash";
import axios from "axios";
import Router from 'next/router';
import Dropzone from './components/Dropzone';
import { pinFile, pinJSON } from './utill';

const URL = process.env.NEXT_PUBLIC_BASE_URL;

class Createnft extends React.Component {
    state = {
        title: "", description: "", productLink: null, openProduct: false, image: null,
        errors: { title: false, description: false, image: false, productLink: false },
        loading: false, toast: false
    };

    componentDidMount() {
    }


    render() {
        const onCreate = async () => {
            let errors = {};
            errors["title"] = this.state.title.length > 0 ? false : true;
            errors["description"] = this.state.description.length > 0 ? false : true;
            errors["image"] = this.state.image !== null ? false : true;
            errors["productLink"] = this.state.productLink !== null ? false : true;

            if ((errors["title"] || errors["description"] || errors["image"] || errors["productLink"])) {
                this.setState({ errors: errors });
            } else {
                this.setState({ errors: errors, loading: true });
                try {
                    let ipfsFile = await pinFile({ image: this.state.image, name: this.state.title });
                    let ipfsMeta = await pinJSON({
                        filename: this.state.title,
                        data: {
                            name: this.state.title,
                            description: this.state.description,
                            image: `ipfs://${ipfsFile}`
                        }
                    });

                    await axios({
                        method: 'GET',
                        url: `${URL}/mintNFT`,
                        params: {
                            name: this.state.title,
                            ipfsHash: ipfsMeta,
                            shop: this.props.shop,
                            productLink: this.state.productLink.title
                        },
                    });

                    this.setState({ loading: false });
                    Router.push({
                        pathname: '/',
                        query: { created: "Created" }
                    });
                } catch (err) {
                    console.log(err);
                    this.setState({ loading: false });
                    Router.push({
                        pathname: '/',
                        query: { created: "Error" }
                    });
                }

            }
        };

        const setImage = (image) => { this.setState({ image: image }) };

        const loadingModal = () => {
            return (
                <Modal open={this.state.loading} title="Minting your NFT" loading={true}>
                </Modal>
            );
        };

        return (
            <Page
                title="Create NFT Gifts"
                primaryAction={{ content: 'Create', onAction: onCreate }}
                secondaryActions={[{ content: 'Cancel', onAction: () => { Router.push('/') } }]}
            >
                {loadingModal()}
                <div style={{ padding: "10px" }}></div>
                <FormLayout>
                    <Card title="Title" sectioned>
                        <TextField label="" value={this.state.title}
                            onChange={(value) => { this.setState({ title: value }) }}
                            placeholder="The Starry Night"
                        />
                        {this.state.errors["title"] ? (<InlineError message="title is required" />) : ""}
                    </Card>

                    <Card title="Description" sectioned>
                        <TextField label="" value={this.state.description}
                            onChange={(value) => { this.setState({ description: value }) }}
                            multiline={4}
                            placeholder="The Starry Night is an oil-on-canvas painting by the Dutch Post-Impressionist painter Vincent van Gogh. Painted in June 1889, it depicts the view from the east-facing window of his asylum room at Saint-Rémy-de-Provence, just before sunrise, with the addition of an imaginary village. "
                        />
                        {this.state.errors["description"] ? (<InlineError message="description is required" />) : ""}
                    </Card>

                    <Card title="Image" sectioned>
                        <Dropzone setImage={setImage} />
                        {this.state.errors["image"] ? (<InlineError message="image is required" />) : ""}
                    </Card>

                    <Card title="Product" sectioned>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Button
                                primary={true}
                                onClick={() => { this.setState({ openProduct: !this.state.openProduct }) }}>
                                Link product
                            </Button>
                            <div style={{ padding: "5px" }}>
                            </div>
                            {this.state.productLink ? (<div>
                                <Thumbnail
                                    source={this.state.productLink.imageLink || "default"}
                                    alt={this.state.productLink.title}
                                />
                                <p style={{ fontWeight: "bold" }}>{this.state.productLink.title}</p>
                            </div>) : ""}
                        </div>
                        <ResourcePicker resourceType="Product" open={this.state.openProduct}
                            allowMultiple={false} selectMultiple={false}
                            onSelection={(selectPayload) => {
                                let id = selectPayload.selection[0].variants[0].id.split("/ProductVariant/")[1];
                                let title = selectPayload.selection[0].title;
                                let imageLink = selectPayload.selection[0].images.length > 0 ? selectPayload.selection[0].images[0].originalSrc : null;
                                this.setState({ openProduct: !this.state.openProduct, productLink: { id: id, title: title, imageLink: imageLink } });
                            }}
                            onCancel={() => { this.setState({ openProduct: false }) }}
                        />
                        <div style={{ padding: "2px" }}></div>
                        <p>Note: the product to gift this NFT with</p>

                        {this.state.errors["productLink"] ? (<InlineError message="product is required" />) : ""}
                    </Card>

                </FormLayout>
            </Page>);
    }
};

export default Createnft;
