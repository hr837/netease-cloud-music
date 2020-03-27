import React from "react"
import styled from "styled-components"
import { Button, Popover, Icon } from "antd"
import { PlayListService } from "~/services/playlist.service"
import { RequestParams } from "~/core/http"
import { ReactComponent as CheckSvg } from "~/assets/icons/check.svg"
import { ReactComponent as AreaSvg } from "~/assets/icons/area.svg"
import { ReactComponent as PianoSvg } from "~/assets/icons/piano.svg"
import { ReactComponent as CoffeeSvg } from "~/assets/icons/coffee.svg"
import { ReactComponent as SmileSvg } from "~/assets/icons/smile.svg"
import { ReactComponent as ThemeSvg } from "~/assets/icons/theme.svg"
import { Subscription } from "rxjs"

const components = {
  Wrapper: styled.div``,
  Panel: styled.div`
    width: 520px;
    height: 300px;
    overflow-y: auto;

    .activated {
      border-color: red;
      color: red;
    }
  `,
  TypeItem: styled.div`
    margin: 5px 0;
    .type-name {
      flex-basis: 80px;
      color: #e3a0a0;
      display: inline-flex;
      align-items: center;
      height: 30px;
    }
    .cates {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
    }
    .cat-icon {
      font-size: 24px;
      margin-right: 10px;
    }
  `,
  TagItem: styled.div`
    border: 1px solid #f2f2f2;
    line-height: 30px;
    height: 30px;
    text-align: center;
    position: relative;
    &:hover {
      cursor: pointer;
      background-color: #fdfdfd;
    }
    .hot {
      color: red;
      position: absolute;
      top: 0;
      right: 0;
      font-size: 8px;
      line-height: 10px;
    }
    .tag-checked-icon {
      position: absolute;
      bottom: -1px;
      right: -1px;
      font-size: 18px;
    }
  `
}

type CategoryProp = {
  name: string
  onChange: (name: string) => void
}

type CategoryState = {
  resData: {
    all: cateInfo
    sub: cateInfo[]
    categories: { [key: string]: string }
  } | null
}

interface cateInfo {
  name: string
  category: string
  hot: boolean
}

const catListIconSetting = [
  { name: "语种", icon: AreaSvg },
  { name: "风格", icon: PianoSvg },
  { name: "场景", icon: CoffeeSvg },
  { name: "情感", icon: SmileSvg },
  { name: "主题", icon: ThemeSvg }
]

export default class CategoryPanel extends React.Component<CategoryProp, CategoryState> {
  constructor(props) {
    super(props)
    this.state = {
      resData: null
    }
  }

  private subscription: Subscription

  public componentDidMount() {
    this.subscription = new PlayListService().getAllTags(new RequestParams()).subscribe(data => {
      this.setState({
        resData: data
      })
    })
  }

  public componentWillUnmount() {
    if (this.subscription) this.subscription.unsubscribe()
  }

  public render() {
    if (!this.state.resData) return <components.Wrapper></components.Wrapper>
    return (
      <components.Wrapper>
        <Popover title="添加标签" trigger="click" placement="bottomLeft" content={this.getContent()}>
          <Button style={{ fontSize: "12px", padding: "0 10px", height: "26px" }}>
            {this.props.name}
            <Icon type="down" style={{ fontSize: "10px" }} />
          </Button>
        </Popover>
      </components.Wrapper>
    )
  }

  private getContent() {
    if (!this.state.resData) return <div></div>

    const allName = this.state.resData!.all.name

    return (
      <components.Panel>
        <components.TagItem className={this.getTagClassName(allName)} onClick={() => this.props.onChange(allName)}>
          {allName}
          {this.getCheckedIcon(allName)}
        </components.TagItem>
        {Object.entries(this.state.resData.categories).map(([k, v]) => {
          const cates = this.state.resData!.sub.filter(x => x.category.toString() === k.toString())
          return (
            <components.TypeItem key={k} className="flex-row">
              <div className="type-name">
                {this.getCatIcon(v)}
                <span>{v}</span>
              </div>
              <div className="cates">
                {cates.map((item, index) => (
                  <components.TagItem
                    key={index}
                    className={this.getTagClassName(item.name)}
                    onClick={() => this.props.onChange(item.name)}
                  >
                    {item.name}
                    {this.getHotSpan(item.hot)}
                    {this.getCheckedIcon(item.name)}
                  </components.TagItem>
                ))}
              </div>
            </components.TypeItem>
          )
        })}
      </components.Panel>
    )
  }

  private getCatIcon(name) {
    const item = catListIconSetting.find(x => x.name === name)
    if (item) {
      return <Icon className="cat-icon" component={item.icon as any}></Icon>
    } else {
      return undefined
    }
  }

  private getCheckedIcon(name) {
    return name === this.props.name ? <Icon className="tag-checked-icon" component={CheckSvg as any}></Icon> : undefined
  }

  private getTagClassName(name) {
    return name === this.props.name ? "activated" : ""
  }

  private getHotSpan(hot: boolean) {
    return hot ? <span className="hot">hot</span> : undefined
  }
}
