package leaflife.widget.jsrpc.serializer;

import java.io.EOFException;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.MarshallException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to Character object and JSON string.
 * @author huangchao
 */
public class CharacterSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {char.class, Character.class};

    public Class[] getSerializableClasses()
    {
        return serializable_classes;
    }

    public String marshall(Object obj, int level) throws MarshallException
    {
        return new StringBuffer("'").append(((Character) obj).charValue()).append("'").toString();
    }

    public Object unmarshall(Tokener json, Class desired_class) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        try
        {
            int token = json.nextToken();
            if (token == Tokener.STRING || (token == Tokener.CHARACTERS && json.isNumber()))
            {
                String text = json.getTokenText();
                if (text.length() == 1)
                {
                    return new Character(text.charAt(0));
                }
            }
        }
        catch (EOFException e)
        {
        }
        catch (NumberFormatException e)
        {
        }
        throw new UnmarshallException("205");  // can not convert JSON string to character object
    }
}
