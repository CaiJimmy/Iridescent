<template>
    <div class="NotFound">
        <md-empty-state class="md-accent"
            md-rounded
            md-icon="error"
            md-label="404 Not Found"
            md-description="Comprueba de nuevo el link">
            <md-button class="md-primary md-raised"
                v-on:click="$router.replace('/')">Volver al inicio</md-button>
        </md-empty-state>
    </div>
</template>

<script>
export default {
    name: 'NotFound',
    metaInfo: {
        title: '404 Not Found'
    },
}
</script>
<style scoped>
.NotFound {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

