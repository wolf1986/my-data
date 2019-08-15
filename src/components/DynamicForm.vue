<template>
    <div>
        <h4>My component</h4>
        <form>
            <template v-for="field in fields">
                <component
                    :is="field.type"
                    v-model="field.value"
                    v-bind="field.props || {}"
                    :key="field.id"
                ></component>
            </template>
        </form>
        <pre>{{JSON.stringify(fields, null, 4)}}</pre>
    </div>
</template>

<script>
export default {
    // name: 'ComponentName',
    data() {
        return {
            value1: 'test',
        };
    },
    props: {
        fields: Array,
    },
    methods: {
        getFormValues: function(submitEvent) {
            submitEvent.preventDefault();
            console.log('Form submitted!', submitEvent);
        },
    },
};
</script>

<style>
</style>
