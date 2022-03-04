import { CANVAS_OBJECT_TYPE_PREFIX } from '@common/constants';
import { cardStepsDictionary, getCardStep } from '@common/helpers';
import { CornerRadiusContext, FabricContext, ZipCodeContext } from '@ee-context';
import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { AddressInformation } from './address-information/address-information';
import Colors from './colors/colors';
import { CornerRadius } from './corner-radius/corner-radius';
import { CustomSide } from './custom-side/custom-side';
import { DesignCountertop } from './design-countertop/design-countertop';
import drawingTool from './design-countertop/drawer/drawingTool';
import { DiagonalCorners } from './diagonal-corners/diagonal-corners';
import { Edges } from './edges/edges';
import Materials from './materials/materials';
import './scrollable-area.scss';
import {TearOutCountertop} from "./tear-out-countertop/tear-out-countertop";

export interface ScrollableAreaProps {
    active?: string;
}

function smoothScrollIntoView(element: any): void {
    if (element !== null && element.current !== null) {
        element.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest',
        });
    }
}

export function ScrollableArea(props: ScrollableAreaProps) {
    const containerRef: any = useRef(null);
    const colorRef: any = useRef(null);
    const countertopRef: any = useRef(null);
    const materialRef: any = useRef(null);
    const informationRef: any = useRef(null);
    const cornerRadiusRef: any = useRef(null);
    const edgeRef: any = useRef(null);
    const diagonalCornerRef: any = useRef(null);
    const customSideRef: any = useRef(null);

    const { zipcode } = useContext(ZipCodeContext);
    const { selectedCornerRadiusOnCardState } = useContext(CornerRadiusContext);
    const { canvas } = useContext(FabricContext);
    const { active } = props;
    const selectedCornerRadiusOnCard = selectedCornerRadiusOnCardState.cornerRadius;

    useLayoutEffect(() => {
        switch (props.active) {
            case 'color':
                smoothScrollIntoView(colorRef);
                break;
            case 'material':
                smoothScrollIntoView(materialRef);
                break;
            case 'countertop':
                smoothScrollIntoView(countertopRef);
                break;
            case 'information':
                smoothScrollIntoView(informationRef);
                break;
        }
    }, [active]);

    // Used to remove the corner radius circles when the corner radius card goes behind the design countertop card or
    // when the page is scrolled down and the corner radius card is not anymore visible
    useEffect(() => {
        // get the scrollable area
        const scrollableArea = document.getElementsByClassName('site-layout')[0];

        if (!scrollableArea) {
            return;
        }

        const removeCornerRadiusCircles = () => {
            if (
                !countertopRef ||
                !countertopRef.current ||
                !cornerRadiusRef ||
                !cornerRadiusRef.current ||
                !selectedCornerRadiusOnCard ||
                !canvas
            ) {
                return;
            }

            const countertopDimensions = countertopRef.current.getBoundingClientRect();
            const cornerRadiusDimensions = cornerRadiusRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (
                cornerRadiusDimensions.bottom < countertopDimensions.height ||
                cornerRadiusDimensions.top > windowHeight
            ) {
                drawingTool.removeObjectByName(canvas, CANVAS_OBJECT_TYPE_PREFIX.CORNER_RADIUS_CIRCLE);
            }
        };

        scrollableArea.addEventListener('scroll', removeCornerRadiusCircles);

        return () => scrollableArea.removeEventListener('scroll', removeCornerRadiusCircles);
    }, [countertopRef, cornerRadiusRef, canvas, selectedCornerRadiusOnCard]);

    return (
        <div id="container" ref={containerRef}>
            <div id="information" ref={informationRef}>
                <AddressInformation
                    stepInfo={getCardStep(cardStepsDictionary['Information'])}
                    step={cardStepsDictionary['Information']}
                />
            </div>

            <div id="material" ref={materialRef}>
                <Materials
                    step={cardStepsDictionary['Material']}
                    stepInfo={getCardStep(cardStepsDictionary['Material'])}
                />
            </div>

            <div id="color" ref={colorRef}>
                <Colors step={cardStepsDictionary['Color']} stepInfo={getCardStep(cardStepsDictionary['Color'])} />
            </div>

            <div id="countertop" ref={countertopRef} className={zipcode ? 'sticky' : ''}>
                <DesignCountertop stepInfo={getCardStep(cardStepsDictionary['Design_Countertop'])} />
            </div>

            <div id="edge" ref={edgeRef} className={zipcode ? 'edge-container' : ''}>
                <Edges step={cardStepsDictionary['Edge']} stepInfo={getCardStep(cardStepsDictionary['Edge'])} />
            </div>

            <div id="corner-radius" ref={cornerRadiusRef}>
                <CornerRadius
                    step={cardStepsDictionary['Corner_Radius']}
                    stepInfo={getCardStep(cardStepsDictionary['Corner_Radius'])}
                />
            </div>

            <div id="diagonal-corner" ref={diagonalCornerRef}>
                <DiagonalCorners
                    step={cardStepsDictionary['Diagonal_Corner']}
                    stepInfo={getCardStep(cardStepsDictionary['Diagonal_Corner'])}
                />
            </div>

            <div id="custom-side" ref={customSideRef}>
                <CustomSide
                    step={cardStepsDictionary['Custom_Side']}
                    stepInfo={getCardStep(cardStepsDictionary['Custom_Side'])}
                />
            </div>

            <div id="custom-side" ref={customSideRef}>
                <TearOutCountertop
                    step={cardStepsDictionary['Tear_Out_Countertop']}
                    stepInfo={getCardStep(cardStepsDictionary['Tear_Out_Countertop'])}
                />
            </div>
        </div>
    );
}

export default ScrollableArea;
