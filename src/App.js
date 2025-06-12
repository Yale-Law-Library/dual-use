import LineChart from './LineChart';
import { GlobalStyles } from './GlobalStyles';
import CategoryBubbleChart from './CategoryBubbleChart';
import dataAll from "./data_all.json";
import dataRaqqa from "./data_raqqa.json";
import dataMosul from "./data_mosul.json";
import { scaleLinear } from 'd3-scale';
import styled from 'styled-components';
import mapUrl from './assets/map_group.svg';
import mapSelectedURL from './assets/Map_selected_outline.svg';
import Vector from "./assets/Vector.svg";
import { useRef, useState } from 'react';
import backgroudUrl from "./assets/background.svg";
import { useContainerDimensions } from './ContainerDimensions';

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px;
  box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.25) inset;
  align-items: center;
`;

const IndicatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const MapContainer = styled.div`
padding: 10px 10px 10px 10px;
    background: #FBFEFF;
`;

const MosulIndicator = styled.img`
  position:absolute;
  top:136px;
  left: 373px;
`;

const MosulText = styled.div`
  position:absolute;
  top:198px;
  left: 372px;
  color: #156082;
text-align: center;
font-size: 13px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;

const RaqqaIndicatorMobile = styled.img`
  position:absolute;
  top:118px;
  left: 296px;
`;
const RaqqaIndicator = styled.img`
  position:absolute;
  top:118px;
  left: 296px;
`;

const RaqqaText = styled.div`
  position:absolute;
top:179px;
  left: 294px;
  color: #156082;
text-align: center;
font-size: 13px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;

const ScrollWrapper = styled.div`
  //overflow-x: auto;
  width: 100vw;
`;

const ContentContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: auto;
  z-Index: 2;
  background: #ffffff;
  //overflow-x: scroll;
  width: 100%;
`;

const Credits = styled.div`
color: #156082;
font-family: "Bennett Text";
font-size: 13px;
font-style: normal;
font-weight: 400;
line-height: normal;
text-align: left;`
  ;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
`;

const AppHeader = styled.div`
height: 400px;
width: 100%;
background: rgba(115, 169, 193, 0.85);
z-Index: 0;
position: relative;
  min-height: 400px;
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;

const Circle = styled.div`
border-radius: 50%;
width: 100%;
height: 400px;
position: absolute;
top: 0;
left: 0;
background: radial-gradient(#8FC2D8,#73A9C1);
filter: blur(20px);
opacity: .6;
`;

const HeaderText = styled.div`
display: flex;
position: absolute;
top: 90px;
left: calc(50% - 350px);
justify-content: center;
width: 700px;
flex-direction:column;
`;



const ArticleTitle = styled.div`
font-family: 'Bennett Text', Georgia, serif;
color: #FFF;
text-align: center;
font-size: 30px;
font-style: normal;
font-weight: 400;
line-height: normal;
margin-bottom: 20px;`;

const BodyText = styled.div`
color: #000;
text-align: justify;
font-family: "Bennet Text";
font-size: 14px;
font-style: normal;
font-weight: 500;
line-height: 19px; /* 135.714% */
margin: 10px;
text-align:center;
font-family: "Bennett Text";
`;


function App() {
  const componentRef = useRef(null);
  const { width } = useContainerDimensions(componentRef);
  const isColumn = width < 1430;
  const isMobile = width < 800;
  const [hoveredQuarter, setHoveredQuarter] = useState("");
  const [hoverCategories, setHoverCategories] = useState([]);
  const [selectedName, setSelectedName] = useState("all");

  const allCounts = [...dataAll, ...dataRaqqa, ...dataMosul].flatMap(d => d.categories.map(c => c.count));
  const minCount = Math.min(...allCounts);
  const maxCount = Math.max(...allCounts);

  const sizeScale = scaleLinear()
    .domain([minCount, maxCount])
    .range([8, 150]);

  const selectedData = selectedName === "mosul" ? dataMosul : selectedName === "raqqa" ? dataRaqqa : dataAll;
  const filteredData = selectedData.map(obj => {
    const temp = obj.categories.map((obj) => hoverCategories.length === 0 || hoverCategories.includes(obj.name) ? obj : { name: obj.name, count: 0 });
    return {
      quarter: obj.quarter,
      categories: temp
    };
  });

  const handleSelectName = (name) => {
    if (selectedName === name) {
      setSelectedName("all");
    } else {
      setSelectedName(name);
    }
  };
  return (
    <ScrollWrapper style={isMobile ? { overflowX: 'hidden' } : {}}>
      <AppContainer className="App" ref={componentRef}>

        <AppHeader style={{ isMobile }}>
          <img height={isMobile ? 350 : 700} width={isMobile ? 350 : ""} src={backgroudUrl} alt="map" />
          <Circle></Circle>
          <HeaderText style={isMobile ? { width: 350, top: "24px", left: "calc(50% - 175px)" } : {}}>
            <ArticleTitle style={{ fontSize: isMobile ? "26px" : "32px" }}>The Rise of “Dual-Use” Objects in War </ArticleTitle>
            <BodyText style={{ fontSize: isMobile ? "11px" : "14px" }}><span>
              <a
                style={{ color: "#000" }}
                href="https://law.yale.edu/oona-hathaway"
                target="_blank"
                rel="noreferrer"
              >Oona A. Hathaway</a></span>, <span>
                <a
                  style={{ color: "#000" }}
                  href="https://azmatzahra.com/"
                  target="_blank"
                  rel="noreferrer"
                >Azmat Khan</a></span>, and <span>
                <a
                  style={{ color: "#000" }}
                  href="https://www.mararevkin.com/"
                  target="_blank"
                  rel="noreferrer"
                >Mara Revkin</a></span></BodyText>
            <BodyText>Militaries are increasingly targeting “dual use objects”—objects that serve both civilian and military purposes. Drawing on an original dataset of the U.S. military’s airstrike reports and ground reporting in Iraq and Syria, <span>
              <a
                style={{ color: "#000" }}
                href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4938707"
                target="_blank"
                rel="noreferrer"
              >The Dangerous Rise of “Dual-Use” Objects in War</a></span> (Yale Law Journal, 2025), illustrates how targeting such “dual-use” objects has undermined critical legal protections for civilians.  </BodyText>
            <BodyText>Here we translate the figures from the article into interactive data visualizations. </BodyText>
          </HeaderText>

        </AppHeader>



        <ContentContainer style={{ flexDirection: isColumn ? 'column' : 'row' }}>
          <MapContainer style={isColumn ? { display: "flex", justifyContent: "center" } : {}}>
            <div style={{ position: "sticky", top: 0 }}>
              <div style={{ position: "relative" }}>
                <div>
                  <img height={isMobile ? 350 : 700} src={mapUrl} alt="map" />
                  {selectedName === "all" && <img style={{ position: "absolute", top: 0, left: 0 }} height={isMobile ? 350 : 700} src={mapSelectedURL} alt="map" />}
                </div>

              </div>

              <IndicatorContainer style={{ opacity: selectedName !== "mosul" ? .5 : 1 }} onClick={() => handleSelectName("mosul")}>
                <MosulIndicator style={isMobile ? {
                  top: "68px",
                  left: "187px"
                } : {}} height={isMobile ? 35 : 70} width={isMobile ? 20 : 40} src={Vector} alt="map" />
                <MosulText style={isMobile ? { fontSize: "8px", top: "99px", left: "184px", fontWeight: selectedName === "mosul" ? 700 : 400 } : { fontWeight: selectedName === "mosul" ? 700 : 400 }}>Mosul</MosulText>
              </IndicatorContainer>
              <IndicatorContainer style={{ opacity: selectedName !== "raqqa" ? .5 : 1 }} onClick={() => handleSelectName("raqqa")}>
                <RaqqaIndicator style={isMobile ? {
                  top: "58px",
                  left: "148px",
                } : {}} height={isMobile ? 35 : 70} width={isMobile ? 20 : 40} src={Vector} alt="map" />
                <RaqqaText style={isMobile ? { fontSize: "8px", top: "89px", left: "146px", fontWeight: selectedName === "mosul" ? 700 : 400 } : { fontWeight: selectedName === "mosul" ? 700 : 400 }} >Raqqa</RaqqaText>
              </IndicatorContainer>
              {!isMobile && <>
                <Credits style={{ position: "absolute", top: "585px" }}>The underlying data are available on <span>
                  <a
                    style={{ color: "#156082" }}
                    href="http://www.google.com/"
                    target="_blank"
                    rel="noreferrer"
                  >Dataverse</a></span>.</Credits>
                <Credits style={{ position: "absolute", top: "625px" }}>Data visualization by Feeling Data and Hampshire Analytics.</Credits>
                <Credits style={{ position: "absolute", top: "665px" }}>We thank the Yale Law School Oscar M. Ruebhausen Fund</Credits>
                <Credits style={{ position: "absolute", top: "680px" }}> for its support for this project.</Credits>
              </>}

            </div>


          </MapContainer>
          <RightPanel style={{ padding: isMobile ? "10px 2px" : "10px" }}>
            <LineChart selectedName={selectedName} setSelectedName={setSelectedName} isMobile={isMobile} setHoverCategories={setHoverCategories} hoverCategories={hoverCategories} hoveredQuarter={hoveredQuarter} setHoveredQuarter={setHoveredQuarter} data={selectedData} name={selectedName === "mosul" ? "Mosul, Iraq" : selectedName === "raqqa" ? "Raqqa, Syria" : "All"} />
            <CategoryBubbleChart isMobile={isMobile} hoverCategories={hoverCategories} setHoveredQuarter={setHoveredQuarter} hoveredQuarter={hoveredQuarter} data={selectedData} sizeScale={sizeScale} />
            {isMobile && <>
              <Credits>This data is available on <span>
                <a
                  style={{ color: "#156082" }}
                  href="http://www.google.com/"
                  target="_blank"
                  rel="noreferrer"
                >Dataverse</a></span>.</Credits>
              <Credits >Data visualization by Feeling Data and Hampshire Analytics.</Credits>
              <Credits >We thank the Yale Law School Oscar M. Ruebhausen Fund</Credits>
              <Credits > for its support for this project.</Credits>
            </>}
          </RightPanel>

        </ContentContainer>
      </AppContainer>
    </ScrollWrapper >

  );
}

export default App;
