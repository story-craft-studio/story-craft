import React, {useEffect, useState} from "react";
import { CommandListItemContext } from "../../../components/control/passage-command-area/CommandListItemContext";
import { CommandBlockHolder, commandColors } from "./base-ui";
import {CommandBreakPointComponent} from "../../template/mui-template/command-break-point-component";
import _ from "lodash";
import {Passage, Story, TagColors} from "../../../store/stories";
import Box from "@mui/material/Box";
import { CommandType } from "../PassageCommandTypeDef";


export default function TagBlock(props: {
    story: Story
    passage?: Passage,
    onChange?: (newTag: string, index: number) => void,
    editable?: boolean, //default: true
    onRemove?: (index: number) => void,
}) {
    const [existingTags, setExistingTags] = useState(props.passage?.tags || []);
    useEffect(() => {
        setExistingTags(props.passage?.tags || []);
    }, [props.passage?.tags]);


    const [editable, setEditable] = useState(false);
    useEffect(() => {
        if (_.isNil(props.editable) || props.editable) {
            setEditable(true);
            return;
        }
        setEditable(false);
    }, [props.editable]);

    const onChangeTag = (newTag: string, index: number) => {
        if (!_.isFunction(props.onChange)) return;
        props.onChange( newTag, index );
    }

    function onRemove(index: number) {
        if (!_.isFunction(props.onRemove)) return;
        props.onRemove( index );
    }

    return (
        <CommandBlockHolder>
            {
                existingTags.map((eachTag, i) => {
                    return (
                        <Box key={i}
                            sx={{
                                position: 'relative',
                            }}
                        >
                            <CommandBreakPointComponent
                                bgColor={commandColors[CommandType.tag]}
                                value={eachTag || 'EmptyTag'}
                                collapsible={true}
                                editable={editable}
                                onChange={ev => onChangeTag(ev.target.value, i)}
                                onRemove={ev => onRemove(i)}
                            />
                        </Box>
                    )
                })
            }
        </CommandBlockHolder>
    );
}
