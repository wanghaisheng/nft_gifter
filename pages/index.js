import React from "react";
import { Page, Card, Tabs, Banner, Spinner, Thumbnail, Button } from "@shopify/polaris";
import Router from 'next/router';
import axios from "axios";
import { Promise } from "bluebird";
import NFTList from "./components/NFTList";

class Index extends React.Component {
  state = { selectedTab: 0, created: null };

  reloadData = () => {
    axios({
      method: 'GET',
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/getMyNFTs`,
      params: {
        shop: this.props.shop
      }
    }).then(async (res) => {
      let nftdata = await Promise.map(res.data.data, function (data) {
        return axios({
          method: 'GET',
          url: `https://ipfs.io/ipfs/${data.url.split("ipfs://")[1]}`
        });
      }, { concurrency: 5 });

      this.setState({
        myNFTs: res.data.data.map((x, xdx) => ({
          ...x, image: nftdata[xdx].data.image,
          description: nftdata[xdx].data.description
        })).reverse()
      });
    }).catch(err => {
      this.setState({ myNFTs: "error" });
      console.log(err);
    });
  };

  componentDidMount() {
    let query = Object.assign({}, Router.query);
    if (query.created) {
      this.setState({ created: query.created, toastActive: true, myNFTs: false });
    }
    if (this.props.shop) {
      this.reloadData();
    }
  }

  render() {

    const toggleBanner = (() => { this.setState({ created: null }) });
    const handleTabChange = (selectedTabIndex) => { this.setState({ selectedTab: selectedTabIndex }) };

    const bannerMarkup = () => {
      switch (this.state.created) {
        case "Created":
          return <Banner title={"NFT Created: " + this.state.created}
            onDismiss={toggleBanner}
          />
          break;
        case "Error":
          return <Banner title={this.state.created}
            onDismiss={toggleBanner}
          />
          break;
        default:
          return null;
          break;
      }
    }

    const tabs = [
      {
        id: 'active',
        content: 'Active',
        panelID: 'active-tab',
      },
      {
        id: 'sold',
        content: 'Sold',
        panelID: 'sold-tab',
      }
    ];

    const showData = () => {
      if (Array.isArray(this.state.myNFTs)) {
        let sold = this.state.selectedTab === 0 ? false : true;
        return <NFTList myNFTs={this.state.myNFTs.filter(data => data.sold === sold)} />
      } else if (this.state.myNFTs === "error") {
        return <Button onClick={() => {
          this.setState({ myNFTs: false });
          this.reloadData();
        }}>Re-load</Button>
      } else {
        return <Spinner accessibilityLabel="Spinner loading" size="large" />;
      }
    }

    return (
      <Page
        title="NFT Gifts"
        primaryAction={{
          content: 'Create NFT', onAction: () => {
            Router.push({
              pathname: '/createnft'
            })
          }
        }}
      >
        <Card>
          <Tabs tabs={tabs} selected={this.state.selectedTab} onSelect={handleTabChange.bind(this)}>
            <Card.Section >
              {showData()}
            </Card.Section>
          </Tabs>
        </Card>
        <div style={{ marginTop: '40vh' }}>
          {bannerMarkup()}
        </div>
      </Page>);
  }
};

export default Index;