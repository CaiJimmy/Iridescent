<template>
	<div class="topicCards--grid">
		<router-link :to="'/t/' + topicID">
			<div class="topicCard--image"
			    :style="{ background: `url(${topic.image})`}"></div>
			<div class="topicCard--filter"
			    :style="{background: `rgb(${topic.color.join(',')})`}"></div>
			<div class="topicCard--meta">
				<h1>{{ topic.name }}</h1>
				<h2 v-if="levels">{{ levels[topic.level].name }}</h2>
			</div>
		</router-link>
	</div>
</template>
<script>

export default {
	props: ['topic', 'topicID', 'levels', 'action']
}
</script>

<style lang="scss">
.topicCards--wrapper {
	overflow: hidden;
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-start;
	flex-direction: column;
	.topicCards--grid {
		flex-basis: auto;
		position: relative;
		height: auto;
		box-shadow: 8px 14px 38px rgba(39, 44, 49, 0.06),
			1px 3px 8px rgba(39, 44, 49, 0.03);
		margin-bottom: 2em;
		border-radius: 4px;
		overflow: hidden;
		padding: 20px 10px;
		transition: all 0.5s ease;

		&:hover {
			box-shadow: 0 0 1px rgba(39, 44, 49, 0.1),
				0 3px 16px rgba(39, 44, 49, 0.07);
			transition: all 0.3s ease;
			transform: translate3D(0, -1px, 0);
		}
		a:hover {
			text-decoration: none;
		}

		.topicCard--image {
			height: 100%;
			width: 100%;
			position: absolute;
			top: 0;
			left: 0;
			background-size: cover !important;
			background-position: center center !important;
			opacity: 0.7;
			-webkit-transition: opacity 0.35s;
			transition: opacity 0.35s;
		}

		.topicCard--meta {
			position: relative;
			z-index: 2;
			color: #fff;
			text-decoration: none !important;
			display: flex;
			height: 100%;
			justify-content: center;
			flex-direction: column;
			padding: 20px 25px;
			line-height: 1.5;

			h1 {
				font-size: 20px;
				margin: 0;
				font-weight: lighter;
			}

			h2 {
				margin-bottom: 0;
				font-weight: lighter;
				font-size: 15px;
			}
		}

		.topicCard--filter {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 1;
			opacity: 0.6;
			background: #000;
		}

		.removeTopic {
			opacity: 0;
			transition: all 0.5s ease;
			position: absolute;
			right: 0;
			top: 0;
		}

		&:hover {
			.removeTopic {
				opacity: 1;
			}
		}

		.saveTopic {
			position: absolute;
			top: 0;
			right: 0;
		}
	}
}
</style>
