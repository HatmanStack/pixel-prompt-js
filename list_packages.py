import pkg_resources; print('\n'.join([f'{p.key}=={p.version}' for p in pkg_resources.working_set]))
