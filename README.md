## Motivation

When using Vue auto imports, the IDE will jump to the `components.d.ts` file instead of going to the actual file when clicking on a component. This extension fixes that by opening the actual component file that the user intended to go to. Nice and simple.

## Configuration

For each project / workspace you will need to go to workspace settings and configure your Vue project's full path. E.g. `/home/user/projects/my-vue-project` (without trailing slash). The configuration key is called "Vue Project Path".

## License

MIT
