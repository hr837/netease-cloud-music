import React from "react"
import { DjService } from "~/services/dj.service"
import { RequestParams } from "~/core/http"
import styled from "styled-components"
import { Icon } from "antd"
import { Subscription } from "rxjs"

type PayGiftState = {
  items: any[] | null
}

const components = {
  Wrapper: styled.div`
    padding-top: 10px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-row-gap: 10px;
  `,
  Item: styled.div`
    height: 120px;
    display: grid;
    grid-template-columns: 120px 1fr;
  `,
  Image: styled.img`
    width: auto;
    height: 100%;
    &:hover {
      cursor: pointer;
    }
  `,
  Content: styled.div`
    padding: 0 5px;
    .title {
      font-size: 14px;
      height: 30px;
      line-height: 30px;
    }
    .text {
      line-height: 20px;
      height: 20px;
      font-size: 12px;
      color: #797777b8;
    }
    .price {
      color: #cd0505;
      font-size: 16px;
      height: 40px;
      line-height: 40px;
    }
  `
}

export default class PayGift extends React.Component<any, PayGiftState> {
  private subscription: Subscription
  constructor(props) {
    super(props)
    this.state = {
      items: null
    }
  }

  public componentDidMount() {
    this.subscription = new DjService().queryPaygift(new RequestParams({ limit: 4 })).subscribe(data => {
      this.setState({
        items: data.data.list
      })
    })
  }

  public componentWillUnmount() {
    if (this.subscription) this.subscription.unsubscribe()
  }

  public render() {
    if (!this.state.items) {
      return <div />
    }
    return (
      <components.Wrapper>
        {this.state.items.map((item, index) => (
          <components.Item key={index} className="flex-row flex-nowrap">
            <components.Image src={item.picUrl} alt=""></components.Image>
            <components.Content>
              <h4 className="title">{item.name}</h4>
              <div className="text text-hidden">{item.rcmdText}</div>
              <div className="text text-hidden">
                <Icon type="caret-right" />
                {item.lastProgramName}
              </div>
              <div className="price">{this.moneyFormat(item.originalPrice)}</div>
            </components.Content>
          </components.Item>
        ))}
      </components.Wrapper>
    )
  }

  private moneyFormat(value: number) {
    let r = (value / 100).toFixed(0)
    return "￥" + r
  }
}
