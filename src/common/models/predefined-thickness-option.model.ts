import {PredefinedThicknessOptionType} from "@common/enums/predefined-thickness-options";

export interface PredefinedThicknessOption {
    id: number;
    image: any;
    title: string;
    type: PredefinedThicknessOptionType;
    qteGrpID?: number;
}
