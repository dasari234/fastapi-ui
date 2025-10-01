const columns = [
  { 
    key: 'id', 
    label: 'ID', 
    fixed: 'left', 
    width: '80px',
    truncate: true 
  },
  { 
    key: 'name', 
    label: 'Full Name', 
    sortable: true,
    truncate: true 
  },
  { 
    key: 'email', 
    label: 'Email Address', 
    sortable: true,
    truncate: true 
  },
  { 
    key: 'actions', 
    label: 'Actions', 
    fixed: 'right', 
    width: '100px' 
  },
];

<DynamicTable
  url="/api/users"
  columns={columns}
  fixedHeader={true}
  maxHeight="70vh"
  selectable={true}
/>