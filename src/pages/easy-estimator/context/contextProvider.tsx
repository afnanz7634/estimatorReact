import {
    ColorContextProvider,
    CornerRadiusContextProvider,
    CustomSideContextProvider,
    DrawingShapeContextProvider,
    EdgeContextProvider,
    MaterialContextProvider,
    PriceContextProvider,
    ShapeContextProvider,
    StoreContextProvider,
    TearOutCountertopContextProvider,
    ZipCodeContextProvider,
} from '.';
import { DiagonalCornerContextProvider } from './diagonalCornerContext';
import { FabricContextProvider } from './fabricContext';
import { ThicknessContextProvider } from './thicknessContext';

export const ContextProvider = (props: any) => {
    return (
        <PriceContextProvider>
            <ZipCodeContextProvider>
                <StoreContextProvider>
                    <MaterialContextProvider>
                        <ColorContextProvider>
                            <ShapeContextProvider>
                                <DrawingShapeContextProvider>
                                    <FabricContextProvider>
                                        <EdgeContextProvider>
                                            <CornerRadiusContextProvider>
                                                <CustomSideContextProvider>
                                                    <DiagonalCornerContextProvider>
                                                        <ThicknessContextProvider>
                                                            <TearOutCountertopContextProvider>
                                                                {props.children}
                                                            </TearOutCountertopContextProvider>
                                                        </ThicknessContextProvider>
                                                    </DiagonalCornerContextProvider>
                                                </CustomSideContextProvider>
                                            </CornerRadiusContextProvider>
                                        </EdgeContextProvider>
                                    </FabricContextProvider>
                                </DrawingShapeContextProvider>
                            </ShapeContextProvider>
                        </ColorContextProvider>
                    </MaterialContextProvider>
                </StoreContextProvider>
            </ZipCodeContextProvider>
        </PriceContextProvider>
    );
};
