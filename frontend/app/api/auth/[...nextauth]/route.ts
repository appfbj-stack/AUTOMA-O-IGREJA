import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        username: { label: 'Usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        // Usuários locais (hardcoded para MVP — mover para DB depois)
        const users = [
          { id: '1', name: 'Administrador', username: 'admin', password: 'ekklesia2024', role: 'admin' },
          { id: '2', name: 'Operador', username: 'operador', password: 'operador123', role: 'operator' },
        ];

        const user = users.find(
          u => u.username === credentials?.username && u.password === credentials?.password
        );

        if (user) {
          return { id: user.id, name: user.name, email: `${user.username}@local`, role: user.role };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'ekklesia-secret-local-2024',
});

export { handler as GET, handler as POST };
