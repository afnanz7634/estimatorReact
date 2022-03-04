import { DEFAULT_EDGE_NAME, LOCAL_STORAGE_KEY } from '@common/constants';
import { PredefinedThicknessOptionType } from '@common/enums/predefined-thickness-options';
import { EdgeModel } from '@common/models';
import httpClientService from '@core/services/http-client-service';
import localStorageInfo from '@core/services/local-storage-info';
import {
    DrawingShapeContext,
    EdgeContext,
    MaterialContext,
    StoreContext,
    ThicknessContext,
    ZipCodeContext,
} from '@ee-context';
import { useContext, useEffect, useState } from 'react';
import './edges.scss';

const useEdges = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [twoCMArray, setTwoCMArray] = useState<EdgeModel[]>([]);
    const [fourCMArray, setFourCMArray] = useState<EdgeModel[]>([]);

    const { zipcode } = useContext(ZipCodeContext);
    const { selectedStoreState, loadedStore } = useContext(StoreContext);
    const { selectedMaterialState, loadedMaterial } = useContext(MaterialContext);
    const { edges, updateEdges, selectedEdgeState, updateSelectedEdgeByDefault, updateSelectedEdgeByUser } =
        useContext(EdgeContext);
    const { drawingShapes } = useContext(DrawingShapeContext);
    const selectedStore = selectedStoreState.store;
    const { selectedThicknessOption } = useContext(ThicknessContext);
    const selectedMaterial = selectedMaterialState.material;
    const selectedThickness = selectedThicknessOption.thickness;
    const selectedEdge = selectedEdgeState.edge;
    const { isSelectedByUser } = selectedEdgeState;
    const getEdgesBySelectedMaterial = async () => {
        try {
            const retailerSetting = localStorageInfo.getStorageData(LOCAL_STORAGE_KEY.RETAILER_SETTING);
            if (!zipcode || !selectedMaterial || !loadedStore || !loadedMaterial) {
                return;
            }

            const qteGrpID = selectedThickness?.qteGrpID ? selectedThickness.qteGrpID : selectedMaterial.qteGrpID;

            let url = `products/edges?zipCode=${zipcode}&prodQteGrpID=${qteGrpID}`;
            if (retailerSetting.showStores) url = `${url}&storeId=${selectedStore?.companyId}`;

            setLoading(true);
            setError(false);
            const response = await httpClientService.get(url);

            const edgeData: EdgeModel[] = response.data;
            const sortedEdgeData = [...edgeData];
            const defaultIndex = sortedEdgeData.findIndex((edge) => edge.name.includes(DEFAULT_EDGE_NAME));

            if (defaultIndex >= 0) {
                const defaultEdge = sortedEdgeData.splice(defaultIndex, 1);
                sortedEdgeData.unshift(defaultEdge[0]);
                selectedEdge
                    ? checkPrevSelectedEdge(sortedEdgeData, defaultEdge[0])
                    : updateSelectedEdgeByDefault(defaultEdge[0]);
            }

            if (selectedThickness && selectedThickness.type === PredefinedThicknessOptionType['2CM']) {
                const twoCMEdges: EdgeModel[] = [];
                let fourCMEdges: EdgeModel[] = [];
                sortedEdgeData.forEach((edgeData) => {
                    if (edgeData.thinkness === selectedThickness.type) {
                        twoCMEdges.push(edgeData);
                    } else {
                        fourCMEdges.push(edgeData);
                    }
                });
                setTwoCMArray(twoCMEdges);
                setFourCMArray(fourCMEdges);
            }

            updateEdges(sortedEdgeData);
            return sortedEdgeData;
        } catch (error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const checkPrevSelectedEdge = (edgesData: Array<EdgeModel>, defaultEdge: EdgeModel) => {
        const checkedPrevEdgeIdx = edgesData.findIndex((edge: EdgeModel) => edge.productId === selectedEdge.productId);
        checkedPrevEdgeIdx !== -1 && isSelectedByUser
            ? updateSelectedEdgeByUser(edgesData[checkedPrevEdgeIdx])
            : updateSelectedEdgeByDefault(defaultEdge);
    };

    useEffect(() => {
        getEdgesBySelectedMaterial().then((edges) => updateEdges(edges));
    }, [selectedMaterial, zipcode, loadedStore, loadedMaterial, selectedThickness]);

    const displayDefaultEdges = () => {
        return !selectedThickness || selectedThickness?.type === PredefinedThicknessOptionType['3CM'];
    };

    return {
        loading,
        error,
        edges,
        selectedMaterial,
        drawingShapes,
        zipcode,
        selectedEdge,
        updateSelectedEdgeByUser,
        twoCMArray,
        fourCMArray,
        displayDefaultEdges,
    };
};

export default useEdges;
