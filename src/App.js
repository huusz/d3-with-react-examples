// node modules
import React, { Component } from 'react';
import PickBy from 'lodash/pickBy';
import Map from 'lodash/map';
import MapValues from 'lodash/mapValues';
// project src
import SERVER_HOSTNAME from 'config';
import MainContainer from 'containers/MainContainer';
import SubContainer from 'containers/SubContainer';
import './scss/main.scss';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rawData: [],
      errorState: false,
      isMain: {
        // 현재 메인 그래프의 데이터
        score: true,
        co2: false,
        dust: false,
        temp: false,
        humid: false,
        voc: false,
      },
    };
  }

  componentDidMount() {
    // get Data
    fetch(`${SERVER_HOSTNAME}/data`)
      .then(res => res.json())
      .then(data => {
        this.setState({
          rawData: data,
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          errorState: true,
        });
      });
  }

  // 서브 그래프에서 클릭 이벤트 발생 시 mainData 변경
  changeMainGraph = keyName => {
    // false로 전체 value 초기화
    const isMain = MapValues(this.state.isMain, () => {
      return false;
    });
    // 클릭한 그래프를 true로
    isMain[keyName] = true;
    this.setState({
      isMain,
    });
  };

  render() {
    // 네트워크 오류
    if (this.state.errorState) {
      return <h1>네트워크 요청 중 에러가 발생하였습니다.</h1>;
    }
    // 데이터가 없을 경우
    if (!this.state.rawData.length) {
      return null;
    }

    // main 그래프의 data key
    const mainDataKey = Object.keys(
      PickBy(this.state.isMain, isTrue => {
        return isTrue;
      }),
    )[0];

    // sub 그래프의 data keys
    const subDataKeys = Object.keys(
      PickBy(this.state.isMain, isTrue => {
        return !isTrue; // return Array
      }),
    );

    // 데이터 depth를 flat하게 만드는 부분
    // {timestamp, score, sensor{co2, dust, temp, humid, voc}}
    // => {timestamp, score, co2, dust, temp, humid, voc}
    const flatData = this.state.rawData;
    if (flatData[0].sensor) {
      // 가공 되지 않은 상태이면 (첫 로드일 때,)
      Map(flatData, (el, i) => {
        flatData[i] = {
          timestamp: el.timestamp,
          score: el.score,
          co2: el.sensor.co2,
          dust: el.sensor.dust,
          temp: el.sensor.temp,
          humid: el.sensor.humid,
          voc: el.sensor.voc,
        };
      });
    }

    return (
      <div className="App">
        <MainContainer data={flatData} dataKey={mainDataKey} />
        <SubContainer
          data={flatData}
          dataKeys={subDataKeys}
          changeMainGraph={this.changeMainGraph}
        />
      </div>
    );
  }
}

export default App;
