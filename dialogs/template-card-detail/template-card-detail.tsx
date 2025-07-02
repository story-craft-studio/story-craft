import * as React from 'react';
import {
	Box,
	Typography,
	Paper,
	SxProps,
} from '@mui/material';
import './template-card-detail.css';

interface TemplateCardDetailProps {
	onClose: () => void;
	onPlayDemo?: () => void;
	templateTitle?: string;
	templateImage?: string;
	storyTemplate?: string;
	characterImages?: string[];
}

const cardStyle: SxProps = {
	position: 'relative',
	width: '272px',
	height: '126px',
	bgcolor: 'white',
	borderRadius: '10px',
	boxShadow: '0 4px 4px rgba(0, 0, 0, 0.25)',
	p: 0,
	display: 'flex',
	flexDirection: 'column',
};

const characterImageStyle: SxProps = {
	width: '71px',
	height: '66.29px',
	borderRadius: '20px',
	boxShadow: '0 4px 4px rgba(0, 0, 0, 0.25)',
	objectFit: 'cover',
};

export const TemplateCardDetail: React.FC<TemplateCardDetailProps> = ({
	onClose,
	onPlayDemo,
	templateTitle = "",
	templateImage,
	storyTemplate,
	characterImages = []
}) => {
	return (
		<Box className="template-card-detail">
			<Paper sx={cardStyle}>
				{/* Character Pack Include Text */}
				<Typography
					sx={{
						color: 'black',
						fontSize: '12px',
						fontWeight: 400,
						position: 'absolute',
						top: '6px',
						left: '10px',
					}}
				>
					Character Pack Include
				</Typography>

				{/* Character Images Row */}
				<Box
					sx={{
						position: 'absolute',
						top: '39px',
						left: '10px',
						display: 'flex',
						gap: '18px',
						alignItems: 'center',
					}}
				>
					{characterImages.map((characterImage, index) => (
						<Box
							key={index}
							component="img"
							src={characterImage}
							alt={`Character ${index + 1}`}
							sx={characterImageStyle}
						/>
					))}
				</Box>
			</Paper>
		</Box>
	);
}; 