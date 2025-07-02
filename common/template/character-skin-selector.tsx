import { Autocomplete, Box, TextField, Typography, Paper, Tooltip } from "@mui/material";
import * as React from "react";
import { BoxOwnProps } from "@mui/system/Box/Box";
import { AutocompleteProps } from "@mui/material/Autocomplete/Autocomplete";
import { CharacterMgr } from "../../routes/story-edit/toolbar/settings/character-settings/character-mgr";
import { useComponentTranslation, useErrorMessageTranslation } from "../../util/translation-wrapper";
import { HTMLAttributes, useEffect, useState } from "react";
import { CharacterSkin } from "../../routes/story-edit/toolbar/settings/character-settings/character-typedef";
import { FlexBox } from "./mui-template/flex-box";
import _ from "lodash";
import CrtTVEffectPlayer from "./CrtTVEffectPlayer";
import EvtMgr, { EventName } from "../evt-mgr";
import { PreviewImageModal } from "../passage-command/command-inputs/change-background-command/preview-image-modal";
import './character-skin-selector.css';


type SimpleAutocompleteProps = Partial<AutocompleteProps<
    any,
    boolean | undefined,
    boolean | undefined,
    boolean | undefined
>>

type CharacterSkinSelectorProps = Omit<HTMLAttributes<any>, 'onChange' | 'value'> & BoxOwnProps & {
    autoCompleteProps?: SimpleAutocompleteProps,
    disabled?: boolean,

    characterIndex: number,
    initialSkinIndex: number,
    onChangeSkinIndex: (newSkinIndex: number) => void
}

type SkinOption = {
    label: string,
    imgUrl: string
}


const errorImg = '/common/imgs/image-not-found.png';

export default function CharacterSkinSelector(props: CharacterSkinSelectorProps) {
    let autocompleteProps: SimpleAutocompleteProps = props?.autoCompleteProps
        ? { ...props.autoCompleteProps }
        : {};

    let boxProps: Partial<CharacterSkinSelectorProps> = { ...props };
    delete boxProps.autoCompleteProps;
    delete boxProps.characterIndex;
    delete boxProps.initialSkinIndex;
    delete boxProps.onChangeSkinIndex;
    delete boxProps.disabled;


    const { tComp } = useComponentTranslation('characterSkinSelector');
    const { tError } = useErrorMessageTranslation();

    const { characterIndex, initialSkinIndex, onChangeSkinIndex } = props;

    const character = CharacterMgr.getByIndex(characterIndex);
    const skins = character?.skins || [];
    const allSkinOptions: SkinOption[] = skins.map(eachS => {
        return { label: eachS.id, imgUrl: eachS.imgUrl }
    })
    // console.log('CharacterSkinSelector rerender', characterIndex,character, skins);

    //#region WARNING
    //==========================
    //
    // If you ever get the error: "Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render"..
    //  => that's because one of the useEffect(..) below depends on some of the properties that change every render above: 'skins', 'character', ...
    //
    // Either:
    // + Make sure they depend only on the seldom change properties like 'characterIndex', 'initialSkinIndex', ... or basically anything inside the 'props'
    // + or Put 'character' and 'skins' inside a useState(..) depend on your taste.
    //
    //#endregion

    const [skinImgUrls, setSkinImgUrls] = useState<string[]>(skins.map(eachS => eachS.imgUrl));
    useEffect(() => {
        setSkinImgUrls(
            skins.map(eachS => eachS.imgUrl)
        );
    }, [characterIndex, skins.length]);

    const [selectSkinIndex, setSelectSkinIndex] = useState<number>(initialSkinIndex);
    const curSkin: CharacterSkin | undefined = skins[selectSkinIndex];

    const [selectSkinId, setSelectSkinId] = useState<string>(curSkin?.id || '');

    const getSkinImg = (skinId: string) => {
        if (!skins.length) return '';
        let found = skins.find(
            anyS => anyS.id === skinId
        );
        if (found) return found.imgUrl;
        return errorImg;
    }

    const [curCharSkinImgUrlInvalid, setCurCharSkinImgUrlInvalid] = useState(false);
    const [curCharSkinImgUrl, setCurCharSkinImgUrl] = useState<string>(getSkinImg(selectSkinId));
    useEffect(() => {
        setCurCharSkinImgUrlInvalid(false);
        setCurCharSkinImgUrl(getSkinImg(selectSkinId));
    }, [selectSkinId, characterIndex]);


    const onAutocompleteChange = (ev, newValue: SkinOption | string | null) => {
        let selectedSkinIdAsString: string;
        if (!newValue) {
            selectedSkinIdAsString = '';
        }
        else if (_.isString(newValue)) {
            selectedSkinIdAsString = newValue;
        }
        else {
            selectedSkinIdAsString = newValue.label || '';
        }
        onChangeInnerTextField(selectedSkinIdAsString);
    }

    const [curCharSkinIdNotExist, setCurCharSkinIdNotExist] = useState(true);
    useEffect(() => {
        let notExist = skins.every(
            anyS => anyS.id !== selectSkinId
        )
        setCurCharSkinIdNotExist(notExist);
    }, [characterIndex, selectSkinId]);

    const onChangeInnerTextField = (newSkinId: string) => {
        setSelectSkinId(newSkinId);

        let foundSkinIndex = skins.findIndex(anyS => anyS.id === newSkinId);
        if (foundSkinIndex < 0) {
            onChangeSkinIndex(0);
            return;
        }
        onChangeSkinIndex(foundSkinIndex);
    }

    const curAutocompleteValue: SkinOption = {
        label: selectSkinId,
        imgUrl: curSkin?.imgUrl,
    }

    // Define all hooks unconditionally before any conditional logic
    const previewImageContainerRef = React.useRef<HTMLDivElement>(null);
    const [openPreview, setOpenPreview] = useState(false);
    
    useEffect(() => {
        EvtMgr.on(EventName.mouseMoving, onMouseMove);
        return () => {
            EvtMgr.off(EventName.mouseMoving, onMouseMove);
        }
    }, [openPreview]);

    const onMouseMove = (eventBundleData: {x: number, y: number}) => {
        let imageDiv = previewImageContainerRef.current;
        if (!imageDiv) return;

        let rect = imageDiv.getBoundingClientRect();
        let imageX = rect.left;
        let imageY = rect.top;
        let imageW = rect.width;
        let imageH = rect.height;

        let mouseX = eventBundleData.x;
        let mouseY = eventBundleData.y;

        let inSide = imageX < mouseX && mouseX < imageX + imageW
                    && imageY < mouseY && mouseY < imageY + imageH;

        let needOpenPreview = inSide;

        if (needOpenPreview !== openPreview) {
            setOpenPreview(needOpenPreview);
        }
    }

    let className = 'CharacterSkinSelector ' + (boxProps.className || "");
    if (!character) {
        return <Box {...boxProps} className={className}>
            <Paper 
                elevation={2} 
                sx={{ 
                    px: 2,
                    py: 0.5,
                    backgroundColor: '#f5f5f5',
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '75%'
                }}
            >
                <Typography 
                    fontStyle={'italic'} 
                    textAlign={'center'} 
                    color="error"
                    variant="body2"
                >
                    {tError('noSuchCharacter')}
                </Typography>
            </Paper>
        </Box>
    }

    return (
        <Box {...boxProps} className={className}>
            <FlexBox>
                <Box sx={{ width: '90%' }}>
                    <Autocomplete
                        disabled={props.disabled}
                        freeSolo
                        autoComplete

                        options={allSkinOptions}
                        value={curAutocompleteValue}
                        onChange={onAutocompleteChange}
                        renderInput={(params) => (
                            <Box sx={{ position: 'relative' }}>
                                <TextField
                                    {...params}
                                    label={tComp("skinId")}
                                    onChange={ev => onChangeInnerTextField(ev.target.value)}
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root.MuiInputBase-sizeSmall .MuiAutocomplete-input': {
                                            padding: '2.5px 4px 2.5px 40px !important'
                                        }
                                    }}
                                /> 
                                {curCharSkinImgUrl && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            left: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '30px',
                                            height: '30px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Tooltip
                                            title={
                                                <Box sx={{ p: 1 }}>
                                                    <img
                                                        src={curCharSkinImgUrl}
                                                        alt=""
                                                        style={{
                                                            maxWidth: '200px',
                                                            maxHeight: '200px',
                                                            objectFit: 'contain'
                                                        }}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = errorImg;
                                                        }}
                                                    />
                                                </Box>
                                            }
                                            placement="right"
                                            arrow
                                        >
                                            <img
                                                src={curCharSkinImgUrl}
                                                alt=""
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = errorImg;
                                                }}
                                            />
                                        </Tooltip>
                                    </Box>
                                )}
                                
                            </Box>
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Tooltip 
                                        title={
                                            <Box sx={{ p: 1 }}>
                                                <img 
                                                    src={option.imgUrl} 
                                                    alt={option.label}
                                                    style={{ 
                                                        maxWidth: '200px',
                                                        maxHeight: '200px',
                                                        objectFit: 'contain'
                                                    }}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = errorImg;
                                                    }}
                                                />
                                            </Box>
                                        }
                                        placement="right"
                                        arrow
                                    >
                                        <img 
                                            src={option.imgUrl} 
                                            alt={option.label}
                                            style={{ 
                                                width: '40px', 
                                                height: '40px',
                                                objectFit: 'cover',
                                                border: '1px solid #ccc'
                                            }}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = errorImg;
                                            }}
                                        />
                                    </Tooltip>
                                    <Typography>{option.label}</Typography>
                                </Box>
                            </li>
                        )}
                        sx={{
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderWidth: curCharSkinIdNotExist ? '3px' : '1px',
                                borderColor: curCharSkinIdNotExist ? 'red' : 'black',
                            },
                        }}
                        {...autocompleteProps}
                    />
                </Box>
            </FlexBox>
        </Box>
    )
}

