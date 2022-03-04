import { useEffect, useState } from 'react';
import './toolbar.scss';

interface ToolType {
    name: string;
    icon: any;
    enabled: boolean;
    selected: boolean;
    handler: (param?: boolean) => void;
}

const ToolbarDefaultList: Array<ToolType> = [
    //Todo: Will add more tools here like Redo, Undo, Rotate, Remove, etc
];

const toolbarItem = (item: ToolType, onClick: (tool: ToolType) => void) => (
    <div
        className={`canvas-toolbar-item ${item.enabled && 'enabled'} ${item.selected && 'selected'}`}
        onClick={() => onClick(item)}
        key={item.name}
    >
        {item.icon}
    </div>
);

export const CanvasToolbar = () => {
    const [toolbarList, setToolbarList] = useState<Array<ToolType>>(ToolbarDefaultList);
    const [currentToolName, setCurrentToolName] = useState<string>();

    const onClick = (tool: ToolType) => {
        if (currentToolName === tool.name) {
            resetToolbar();
        } else {
            selectTool(tool.name);
        }
    };

    const resetToolbar = () => {
        const list = toolbarList.map((item: ToolType) => {
            return {
                ...item,
                enabled: true,
                selected: false,
            };
        });

        setToolbarList(list);
        setCurrentToolName(undefined);
    };

    const selectTool = (name: string) => {
        const list = toolbarList.map((item: ToolType) => {
            if (name === item.name) {
                item.handler(true);
            }

            return {
                ...item,
                enabled: true,
                selected: name === item.name,
            };
        });

        setToolbarList(list);
        setCurrentToolName(name);
    };

    const initializeToolbarList = () => {
        const newList = toolbarList.map((tool) => {
            let handler = () => {};
            switch (tool.name) {
                default:
                    break;
            }

            return {
                ...tool,
                handler,
            };
        });

        setToolbarList(newList);
    };

    useEffect(() => {
        initializeToolbarList();
    }, []);

    return <div className="canvas-toolbar-area">{toolbarList.map((tool: ToolType) => toolbarItem(tool, onClick))}</div>;
};
