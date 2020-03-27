import React from "react"
import { DjService } from "~/services/dj.service"
import { RequestParams } from "~/core/http"
import styled from "styled-components"
import { Button, Carousel, Icon } from "antd"
import { Subscription } from "rxjs"

type CateListState = {
  dataSet: CateInfo[][]
  pageIndex: number
  pageCount: number
  current: string
}

export type CateInfo = {
  id: string
  name: string
  picUrl: string
}

type CateListProps = {
  onload: (data: CateInfo[]) => void
}

const components = {
  Wrapper: styled.div`
    display: flex;
    width: 700px;
    margin: auto;
    align-items: center;
    .container {
      width: 660px;
    }
    .operator {
      flex-basis: 20px;
    }
  `,
  Page: styled.div`
    height: 80px;
    display: grid !important;
    grid-template-columns: repeat(9, 1fr);
  `,
  Item: styled.div`
    padding: 15px 0;

    .item-icon {
      height: 32px;
      width: 32px;
      background-size: cover;
      margin: auto;
    }
    .item-name {
      text-align: center;
      font-size: 12px;
    }
    &:hover {
      cursor: pointer;
      background-color: #f2f2f2e8;
      border-radius: 5px;
    }
  `
}

export default class CateList extends React.Component<CateListProps, CateListState> {
  private ref: React.RefObject<Carousel>

  constructor(props) {
    super(props)
    this.state = {
      dataSet: [],
      pageIndex: 0,
      pageCount: 0,
      current: ""
    }
    this.ref = React.createRef()
    this.next = this.next.bind(this)
    this.before = this.before.bind(this)
  }

  private subscription: Subscription

  public componentDidMount() {
    this.subscription = new DjService().getCateList(new RequestParams()).subscribe(data => {
      const categories: CateInfo[] = data.categories.map(x => {
        return {
          name: x.name,
          id: x.id,
          picUrl: x.picWebUrl
        }
      })
      this.props.onload(categories.slice(0, 5))

      const result: CateInfo[][] = []
      const pageCount = categories.length / 9
      for (let index = 0; index < pageCount; index++) {
        const start = index * 9
        result.push(categories.slice(start, start + 9))
      }

      this.setState({
        dataSet: result,
        pageCount: pageCount
      })
    })
  }

  public componentWillUnmount() {
    if (this.subscription) this.subscription.unsubscribe()
  }

  public render() {
    if (!this.state.pageCount) {
      return <div></div>
    }
    return (
      <components.Wrapper>
        <div className="operator">
          {this.state.pageIndex > 0 ? <Icon type="left" onClick={this.before} /> : undefined}
        </div>
        <Carousel className="container" ref={this.ref} dots={false}>
          {this.state.dataSet.map((pageData, index) => (
            <components.Page key={index}>{this.getPageItems(pageData)}</components.Page>
          ))}
        </Carousel>
        <div className="operator">
          {this.state.pageIndex < this.state.pageCount - 1 ? <Icon type="right" onClick={this.next} /> : undefined}
        </div>
      </components.Wrapper>
    )
  }

  private before() {
    if (this.ref.current) {
      this.ref.current.prev()
      this.setState(state => ({ pageIndex: state.pageIndex - 1 }))
    }
  }

  private next() {
    if (this.ref.current) {
      this.ref.current.next()
      this.setState(state => ({ pageIndex: state.pageIndex + 1 }))
    }
  }

  private getPageItems(data: CateInfo[]) {
    return data.map(item => (
      <components.Item key={item.name}>
        <div className="item-icon" style={{ backgroundImage: `url(${item.picUrl})` }} />
        <div className="item-name">{item.name}</div>
      </components.Item>
    ))
  }
}
