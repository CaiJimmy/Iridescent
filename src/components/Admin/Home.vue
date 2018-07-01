<template>
    <div class="container">
        <md-card>
            <md-card-header>
                <div class="md-title">Administrar</div>
            </md-card-header>
            <md-list>
                <md-list-item v-for="page in pages"
                    :key="page.slug"
                    v-on:click="$router.push(`/admin/${page.slug}`)">
                    <md-icon>{{ page.icon }}</md-icon>
                    <span class="md-list-item-text">{{ page.name }}</span>
                </md-list-item>
            </md-list>
        </md-card>
    </div>
</template>
<script>
export default {
    name: 'AdminHome',
    metaInfo: {
        title: 'Administrar'
    },
    data () {
        return {
            pages: [
                {
                    name: "Añadir temas / niveles",
                    slug: "taxonomy",
                    icon: "category"
                }
            ]
        }
    },
}
</script>

