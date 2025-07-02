import {useEffect, useRef, useState} from 'react';

import {NavLink, useNavigate} from 'react-router-dom';

import {
	Avatar,
	Box,
	Button,
	Divider,
	Hidden,
	lighten,
	Popover,
	Typography
} from '@mui/material';

import {styled} from '@mui/material/styles';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import Auth from "../../../common/auth/auth";
import {LoggedInUser} from "../../../common/auth/auth-type-def";
import EvtMgr, {EventName} from "../../../common/evt-mgr";
import AppConfig from "../../../app-config";
import { images } from '../../image';

const UserBoxButton = styled(Button)(
	({theme}) => `
        padding-left: ${theme.spacing(1)};
        padding-right: ${theme.spacing(1)};
`
);

const MenuUserBox = styled(Box)(
	({theme}) => `
        background: '#222';
        padding: ${theme.spacing(2)};
`
);

const UserBoxText = styled(Box)(
	({theme}) => `
        text-align: left;
        padding-left: ${theme.spacing(1)};
`
);

const UserBoxLabel = styled(Typography)(
	({theme}) => `
        font-weight: ${theme.typography.fontWeightBold};
        color: "var(--black)";
        display: block;
`
);

const UserBoxDescription = styled(Typography)(
	({theme}) => `
        color: ${lighten(theme.palette.text.secondary, 0.5)}`
);


export default function Userbox() {
	const navigate = useNavigate();
	const [user, setUser] = useState<LoggedInUser | undefined>(undefined);

	const getUserName = () => {
		return Auth.getUsername();
	}

	const onLoggedIn = () => {
		Auth.getCurrentUserInfo()
			.then(userInfo => {
				if (!userInfo) return;
				if (!userInfo.avatar) {
					userInfo.avatar = AppConfig.get('PUBLIC_URL_SHORT') + images.zpsAvatar;
				}

				setUser(userInfo);
			})
			.catch(err => {
				console.error('FATAL getCurrentUserInfo', err);
				if (Auth.isUnauthorizedError(err)) {
					navigate('/status/500');
				}
			})
	}
	const onLoggedOut = () => {
		setUser(undefined);
	}

	useEffect(() => {
		if (user) return;

		if (!Auth.hadLoggedIn()) {
			onLoggedOut();
		} else {
			onLoggedIn();
		}

		EvtMgr.on(EventName.authLoggedIn, onLoggedIn);
		EvtMgr.on(EventName.authLoggedOut, onLoggedOut);

		return () => {
			EvtMgr.off(EventName.authLoggedIn, onLoggedIn);
			EvtMgr.off(EventName.authLoggedOut, onLoggedOut);
		}
	}, []);

	const ref = useRef<any>(null);
	const [isOpen, setOpen] = useState<boolean>(false);

	const handleOpen = (): void => {
		if (Auth.isLoginGuest()) return;
		setOpen(true);
	};

	const handleClose = (): void => {
		setOpen(false);
	};

	const signout = () => {
		Auth.logout();
		navigate('/');
	}

	if (!user)
		return (<></>);

	return (
		<>
			<UserBoxButton
				id={'UserBox'}
				color="secondary" ref={ref} onClick={handleOpen}>
				<Avatar variant="rounded" alt={getUserName()} src={user.avatar}/>
				<Hidden mdDown>
					<UserBoxText>
						<UserBoxLabel variant="body1">{getUserName()}</UserBoxLabel>
					</UserBoxText>
				</Hidden>

				{
					Auth.isLoginGuest()
						? null
						: <Hidden smDown>
							<ExpandMoreTwoToneIcon sx={{ml: 1}}/>
						</Hidden>
				}
			</UserBoxButton>
			<Popover
				anchorEl={ref.current}
				onClose={handleClose}
				open={isOpen}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
			>
				<MenuUserBox sx={{minWidth: 210}} display="flex">
					<Avatar variant="rounded" alt={getUserName()} src={user.avatar}/>
					<UserBoxText sx={{
						paddingTop: '8px',
						fontSize: '0.875rem',
					}}>
						<UserBoxLabel variant="body1">{getUserName()}</UserBoxLabel>
					</UserBoxText>
				</MenuUserBox>
				<Divider sx={{mb: 0}}/>

				{
					Auth.isLoginGuest()
						? null
						: <Box sx={{m: 1}}>
							<Button color="primary" fullWidth onPointerDown={signout}>
								<LockOpenTwoToneIcon sx={{mr: 1}}/>
								Sign out
							</Button>
						</Box>
				}
			</Popover>
		</>
	);
}
